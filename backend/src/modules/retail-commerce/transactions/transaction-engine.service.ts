import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  BadRequestError,
  NotFoundError,
} from "../../../shared/errors/http-errors";
import { CreateTransactionDto } from "./transaction-engine.dto";
import * as repo from "./transaction-engine.repository";

type CartLine = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  gstRate: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
};

type InventoryDemand = {
  productId: string;
  quantity: number;
};

const money = (value: Prisma.Decimal.Value) =>
  new Prisma.Decimal(value).toDecimalPlaces(2);

const percentage = (value: Prisma.Decimal.Value) =>
  new Prisma.Decimal(value).toDecimalPlaces(2);

const sequence = (prefix: string) =>
  `${prefix}-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

const sumMoney = (values: Prisma.Decimal[]) =>
  values.reduce((total, value) => total.plus(value), money(0));

const isInterStateSale = (storeState?: string | null, placeOfSupply?: string) => {
  if (!storeState || !placeOfSupply) {
    return false;
  }

  return storeState.trim().toLowerCase() !== placeOfSupply.trim().toLowerCase();
};

const aggregateDemand = (items: CreateTransactionDto["items"]): InventoryDemand[] => {
  const demandByProductId = new Map<string, number>();

  for (const item of items) {
    demandByProductId.set(
      item.productId,
      (demandByProductId.get(item.productId) || 0) + item.quantity
    );
  }

  return [...demandByProductId.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

export const createTransaction = async (
  organizationId: string,
  dto: CreateTransactionDto
) => {
  return repo.runInTransaction(async (tx) => {
    const store = await repo.findStoreById(tx, organizationId, dto.storeId);
    if (!store) {
      throw new NotFoundError("Retail store not found");
    }

    if (dto.customerId) {
      const customer = await repo.findCustomerById(
        tx,
        organizationId,
        dto.customerId
      );

      if (!customer) {
        throw new NotFoundError("Customer not found");
      }
    }

    const inventoryDemand = aggregateDemand(dto.items);
    const productIds = inventoryDemand.map((item) => item.productId);
    const products = await repo.findProductsByIds(tx, organizationId, productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));

    if (products.length !== productIds.length) {
      throw new BadRequestError("One or more products are invalid or inactive");
    }

    const inventory = await repo.findStoreInventory(
      tx,
      organizationId,
      dto.storeId,
      productIds
    );
    const inventoryByProductId = new Map(
      inventory.map((item) => [item.productId, item])
    );

    const interState = isInterStateSale(store.state, dto.placeOfSupply);

    for (const demand of inventoryDemand) {
      const inventoryItem = inventoryByProductId.get(demand.productId);

      if (!inventoryItem) {
        throw new BadRequestError(`Inventory is not configured for product ${demand.productId}`);
      }

      if (inventoryItem.quantityAvailable < demand.quantity) {
        throw new BadRequestError(`Insufficient inventory for product ${demand.productId}`, {
          productId: demand.productId,
          requestedQuantity: demand.quantity,
          availableQuantity: inventoryItem.quantityAvailable,
        });
      }
    }

    const cartLines: CartLine[] = dto.items.map((item) => {
      const product = productsById.get(item.productId)!;

      const unitPrice = money(item.unitPrice ?? product.mrp);
      const discountAmount = money(item.discountAmount ?? 0);
      const grossAmount = unitPrice.mul(item.quantity);

      if (discountAmount.gt(grossAmount)) {
        throw new BadRequestError(`Discount exceeds line total for product ${item.productId}`);
      }

      const taxableAmount = grossAmount.minus(discountAmount).toDecimalPlaces(2);
      const gstRate = percentage(product.gstRate);
      const gstAmount = taxableAmount.mul(gstRate).div(100).toDecimalPlaces(2);
      const cgstAmount = interState ? money(0) : gstAmount.div(2).toDecimalPlaces(2);
      const sgstAmount = interState ? money(0) : gstAmount.minus(cgstAmount);
      const igstAmount = interState ? gstAmount : money(0);
      const lineTotal = taxableAmount.plus(gstAmount).toDecimalPlaces(2);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discountAmount,
        taxableAmount,
        gstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        lineTotal,
      };
    });

    const subtotal = sumMoney(
      cartLines.map((line) => line.unitPrice.mul(line.quantity).toDecimalPlaces(2))
    );
    const discountTotal = sumMoney(cartLines.map((line) => line.discountAmount));
    const taxableAmount = sumMoney(cartLines.map((line) => line.taxableAmount));
    const cgstTotal = sumMoney(cartLines.map((line) => line.cgstAmount));
    const sgstTotal = sumMoney(cartLines.map((line) => line.sgstAmount));
    const igstTotal = sumMoney(cartLines.map((line) => line.igstAmount));
    const grandTotal = sumMoney(cartLines.map((line) => line.lineTotal));
    const paidAmount = sumMoney(dto.payments.map((payment) => money(payment.amount)));

    if (!paidAmount.equals(grandTotal)) {
      throw new BadRequestError("Payment total must match transaction grand total", {
        paidAmount: paidAmount.toString(),
        grandTotal: grandTotal.toString(),
      });
    }

    const transactionNo = sequence("TXN");
    const invoiceNo = sequence("INV");

    const created = await repo.createTransaction(tx, {
      transactionNo,
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : new Date(),
      status: "CONFIRMED",
      paymentStatus: "PAID",
      store: { connect: { id: dto.storeId } },
      customer: dto.customerId ? { connect: { id: dto.customerId } } : undefined,
      subtotal,
      discountTotal,
      taxableAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
      organization: { connect: { id: organizationId } },
      items: {
        create: cartLines.map((line) => ({
          product: { connect: { id: line.productId } },
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountAmount: line.discountAmount,
          taxableAmount: line.taxableAmount,
          gstRate: line.gstRate,
          cgstAmount: line.cgstAmount,
          sgstAmount: line.sgstAmount,
          igstAmount: line.igstAmount,
          lineTotal: line.lineTotal,
        })),
      },
      invoice: {
        create: {
          invoiceNo,
          status: "ISSUED",
          customer: dto.customerId ? { connect: { id: dto.customerId } } : undefined,
          gstin: store.gstin,
          placeOfSupply: dto.placeOfSupply ?? store.state,
          subtotal,
          taxableAmount,
          cgstTotal,
          sgstTotal,
          igstTotal,
          grandTotal,
          organization: { connect: { id: organizationId } },
        },
      },
    });

    for (const payment of dto.payments) {
      await repo.createPayment(tx, {
        paymentNo: sequence("PAY"),
        method: payment.method,
        status: "PAID",
        amount: money(payment.amount),
        paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
        referenceNo: payment.referenceNo,
        transaction: { connect: { id: created.id } },
        invoice: created.invoice ? { connect: { id: created.invoice.id } } : undefined,
        organization: { connect: { id: organizationId } },
      });
    }

    for (const demand of inventoryDemand) {
      const inventoryItem = inventoryByProductId.get(demand.productId)!;
      const updatedInventory = await repo.decrementInventoryIfAvailable(
        tx,
        inventoryItem.id,
        demand.quantity
      );

      if (!updatedInventory) {
        throw new BadRequestError(`Insufficient inventory for product ${demand.productId}`, {
          productId: demand.productId,
          requestedQuantity: demand.quantity,
        });
      }

      void updatedInventory;
    }

    const hydratedTransaction = await repo.findTransactionByIdForOrganization(
      tx,
      organizationId,
      created.id
    );

    if (!hydratedTransaction) {
      throw new NotFoundError("Created transaction could not be loaded");
    }

    return hydratedTransaction;
  });
};

export const getTransactionById = async (
  organizationId: string,
  transactionId: string
) => {
  const transaction = await repo.findTransactionById(organizationId, transactionId);

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  return transaction;
};

export const listTransactions = (organizationId: string) => {
  return repo.findTransactions(organizationId);
};
