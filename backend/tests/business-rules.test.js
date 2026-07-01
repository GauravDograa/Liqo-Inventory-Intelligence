const assert = require("node:assert/strict");
const test = require("node:test");
const { Prisma } = require("@prisma/client");

const {
  calculateGstLine,
  calculateGstTotals,
  isInterStateSale,
  money,
} = require("../dist/modules/invoices/gst.util");
const {
  validatePaymentReconciliation,
} = require("../dist/modules/invoices/payment-reconciliation.util");
const {
  isLowStock,
  toLowStockSignal,
} = require("../dist/modules/retail-commerce/inventory/low-stock.util");
const {
  buildForecastCandidates,
} = require("../dist/modules/retail-commerce/forecasting/forecasting-rules.util");
const {
  buildRecommendationCandidates,
} = require("../dist/modules/retail-commerce/recommendations/recommendation-rules.util");

test("GST calculation splits intra-state tax into CGST and SGST", () => {
  const line = calculateGstLine(
    {
      productId: "product-1",
      quantity: 2,
      unitPrice: 1000,
      discountAmount: 100,
      gstRate: 18,
    },
    false
  );
  const totals = calculateGstTotals([line]);

  assert.equal(line.taxableAmount.toString(), "1900");
  assert.equal(line.cgstAmount.toString(), "171");
  assert.equal(line.sgstAmount.toString(), "171");
  assert.equal(line.igstAmount.toString(), "0");
  assert.equal(totals.grandTotal.toString(), "2242");
});

test("GST calculation assigns IGST for inter-state sales", () => {
  assert.equal(isInterStateSale("Karnataka", "Maharashtra"), true);

  const line = calculateGstLine(
    {
      productId: "product-1",
      quantity: 1,
      unitPrice: 1000,
      gstRate: 18,
    },
    true
  );

  assert.equal(line.cgstAmount.toString(), "0");
  assert.equal(line.sgstAmount.toString(), "0");
  assert.equal(line.igstAmount.toString(), "180");
  assert.equal(line.lineTotal.toString(), "1180");
});

test("payment reconciliation rejects mismatched invoice totals", () => {
  assert.throws(
    () =>
      validatePaymentReconciliation(money(1180), [
        { amount: new Prisma.Decimal(1000) },
      ]),
    /Invoice total must equal payment total/
  );

  const result = validatePaymentReconciliation(money(1180), [
    { amount: new Prisma.Decimal(700) },
    { amount: new Prisma.Decimal(480) },
  ]);

  assert.equal(result.paymentTotal.toString(), "1180");
});

test("inventory health flags low stock and emits actionable signals", () => {
  const inventory = {
    organizationId: "org-1",
    id: "inventory-1",
    productId: "product-1",
    storeId: "store-1",
    quantityAvailable: 3,
    reorderLevel: 5,
    reorderQuantity: 12,
  };

  assert.equal(isLowStock(inventory), true);
  assert.deepEqual(toLowStockSignal(inventory, "movement-1"), {
    organizationId: "org-1",
    inventoryId: "inventory-1",
    productId: "product-1",
    storeId: "store-1",
    quantityAvailable: 3,
    reorderLevel: 5,
    reorderQuantity: 12,
    referenceMovementId: "movement-1",
  });
});

test("forecast generation uses velocity, seasonality, stockout, and reorder rules", () => {
  const horizonStart = new Date("2026-06-01T00:00:00.000Z");
  const velocity = Array.from({ length: 60 }, (_, index) => ({
    productId: "product-1",
    storeId: "store-1",
    summaryDate: new Date(Date.UTC(2026, 4, index + 1)),
    unitsSold: index >= 30 ? 3 : 1,
  }));

  const forecasts = buildForecastCandidates({
    inventory: [
      {
        productId: "product-1",
        productName: "Mixer Grinder",
        storeId: "store-1",
        storeName: "Koramangala",
        categoryName: "Kitchen",
        quantityAvailable: 4,
        reorderLevel: 8,
        reorderQuantity: 12,
        safetyStockLevel: 3,
      },
    ],
    velocity,
    workflows: ["STOCKOUT_PREDICTION", "REORDER_FORECASTING"],
    horizonStart,
    horizonDays: 14,
    historyWindowDays: 60,
  });

  const stockout = forecasts.find((forecast) => forecast.workflow === "STOCKOUT_PREDICTION");
  const reorder = forecasts.find((forecast) => forecast.workflow === "REORDER_FORECASTING");

  assert.ok(stockout);
  assert.ok(reorder);
  assert.equal(stockout.currentStock, 4);
  assert.ok(Number(stockout.predictedQuantity) > 0);
  assert.ok(stockout.daysUntilStockout <= 14);
  assert.ok(reorder.recommendedReorderQuantity > 0);
});

test("recommendation generation creates replenishment, deadstock, and transfer actions", () => {
  const candidates = buildRecommendationCandidates([
    {
      productId: "product-1",
      productName: "Air Cooler",
      storeId: "surplus-store",
      storeName: "Warehouse",
      quantityAvailable: 80,
      reorderLevel: 10,
      reorderQuantity: 10,
      velocityPerDay: 0.02,
    },
    {
      productId: "product-1",
      productName: "Air Cooler",
      storeId: "demand-store",
      storeName: "Indiranagar",
      quantityAvailable: 2,
      reorderLevel: 12,
      reorderQuantity: 15,
      velocityPerDay: 2,
    },
  ]);

  assert.ok(candidates.some((candidate) => candidate.type === "DEADSTOCK_ALERT"));
  assert.ok(candidates.some((candidate) => candidate.type === "RESTOCK"));
  assert.ok(candidates.some((candidate) => candidate.type === "HIGH_DEMAND_ALERT"));
  assert.ok(candidates.some((candidate) => candidate.type === "TRANSFER"));
});
