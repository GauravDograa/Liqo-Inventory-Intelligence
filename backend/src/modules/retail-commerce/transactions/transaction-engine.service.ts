import { randomUUID } from "crypto";
import {
  BadRequestError,
  NotFoundError,
} from "../../../shared/errors/http-errors";
import { eventBus } from "../../../infrastructure/events";
import * as invoiceService from "../../invoices/invoice.service";
import * as inventoryService from "../inventory/inventory.service";
import { CreateTransactionDto } from "./transaction-engine.dto";
import * as repo from "./transaction-engine.repository";

type InventoryDemand = {
  productId: string;
  quantity: number;
};

const sequence = (prefix: string) =>
  `${prefix}-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

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
  const result = await repo.runInTransaction(async (tx) => {
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

    await inventoryService.validateInventoryAvailability(
      organizationId,
      dto.storeId,
      inventoryDemand,
      tx
    );

    const invoiceDate = dto.transactionDate
      ? new Date(dto.transactionDate)
      : new Date();
    const placeOfSupply = dto.placeOfSupply ?? store.state;
    const invoiceCalculation = invoiceService.calculateInvoiceLines(
      dto.items.map((item) => {
      const product = productsById.get(item.productId)!;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? product.mrp,
        discountAmount: item.discountAmount ?? 0,
        gstRate: product.gstRate,
      };
      }),
      store.state,
      placeOfSupply
    );
    const cartLines = invoiceCalculation.lines;
    const {
      subtotal,
      discountTotal,
      taxableAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
    } = invoiceCalculation.totals;
    const reconciliation = invoiceService.validateInvoicePaymentReconciliation(
      grandTotal,
      dto.payments
    );

    const transactionNo = sequence("TXN");
    const invoiceNumber = await invoiceService.createInvoiceNumber(tx, {
      organizationId,
      storeId: dto.storeId,
      storeCode: store.code,
      invoiceDate,
    });

    const created = await repo.createTransaction(tx, {
      transactionNo,
      transactionDate: invoiceDate,
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
          invoiceNo: invoiceNumber.invoiceNo,
          invoiceDate,
          status: "PAID",
          store: { connect: { id: dto.storeId } },
          customer: dto.customerId ? { connect: { id: dto.customerId } } : undefined,
          financialYear: invoiceNumber.financialYear,
          sequenceNumber: invoiceNumber.sequenceNumber,
          gstin: store.gstin,
          placeOfSupply,
          subtotal,
          taxableAmount,
          cgstTotal,
          sgstTotal,
          igstTotal,
          grandTotal,
          paymentReconciledAt: reconciliation.reconciledAt,
          auditTrail: invoiceService.buildInvoiceAuditTrail({
            createdBy: "TRANSACTION_ENGINE",
            transactionId: transactionNo,
            paymentTotal: reconciliation.paymentTotal.toString(),
            invoiceTotal: reconciliation.invoiceTotal.toString(),
            gstMode: invoiceCalculation.interStateSale ? "INTER_STATE" : "INTRA_STATE",
          }),
          organization: { connect: { id: organizationId } },
        },
      },
    });

    for (const payment of dto.payments) {
      await repo.createPayment(tx, {
        paymentNo: sequence("PAY"),
        method: payment.method,
        status: "PAID",
        amount: invoiceService.toMoney(payment.amount),
        paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
        referenceNo: payment.referenceNo,
        transaction: { connect: { id: created.id } },
        invoice: created.invoice ? { connect: { id: created.invoice.id } } : undefined,
        organization: { connect: { id: organizationId } },
      });
    }

    const inventoryResults = [];

    for (const demand of inventoryDemand) {
      inventoryResults.push(
        await inventoryService.deductInventory(
          {
            organizationId,
            storeId: dto.storeId,
            productId: demand.productId,
            quantity: demand.quantity,
            referenceType: "RETAIL_TRANSACTION",
            referenceId: created.id,
            transactionId: created.id,
            reason: "Retail sale",
            metadata: {
              transactionNo,
            },
          },
          tx
        )
      );
    }

    const hydratedTransaction = await repo.findTransactionByIdForOrganization(
      tx,
      organizationId,
      created.id
    );

    if (!hydratedTransaction) {
      throw new NotFoundError("Created transaction could not be loaded");
    }

    return {
      transaction: hydratedTransaction,
      inventoryResults,
    };
  });

  await inventoryService.publishInventoryEngineEvents(result.inventoryResults);
  if (result.transaction.invoice?.id) {
    await invoiceService.generateAndPersistInvoicePdf(
      organizationId,
      result.transaction.invoice.id
    );
  }
  await eventBus.publish({
    id: randomUUID(),
    name: "retail.transaction.completed",
    occurredAt: new Date(),
    aggregateId: result.transaction.id,
    payload: {
      organizationId,
      transactionId: result.transaction.id,
      storeId: result.transaction.storeId,
      transactionDate: result.transaction.transactionDate,
      grandTotal: result.transaction.grandTotal.toString(),
    },
  });

  const refreshedTransaction = await repo.findTransactionById(
    organizationId,
    result.transaction.id
  );

  if (!refreshedTransaction) {
    throw new NotFoundError("Created transaction could not be loaded");
  }

  return refreshedTransaction;
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
