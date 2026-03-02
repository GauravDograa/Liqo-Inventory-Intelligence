console.log("USING FIXED SCHEMA-ALIGNED SCRIPT WITH ORGANIZATION");
require("dotenv").config();
const prisma = require("../src/config/prisma");

async function migrate() {
  console.log("Starting migration...");

  const stores = require("../data/store_master.json");
  const skus = require("../data/sku_master.json");
  const transactions = require("../data/transactions.json");
  const inventoryData = require("../data/inventory.json");

  const storeMap = {};
  const skuMap = {};

  try {
    /*
    =========================================
    0️⃣ CREATE ORGANIZATION
    =========================================
    */
    const org = await prisma.organization.upsert({
      where: { id: "default-org-001" },
      update: {},
      create: {
        id: "default-org-001",
        name: "Liqo Enterprise",
      },
    });
    const organizationId = org.id;
    console.log("✅ Organization ready:", organizationId);

    /*
    =========================================
    1️⃣ INSERT STORES
    =========================================
    */
    for (const store of stores) {
      const created = await prisma.store.upsert({
        where: { externalId: store.Store_ID },
        update: {},
        create: {
          externalId: store.Store_ID,
          code: String(store.Store_ID),
          name: store.Store_Name,
          region: store.Region || null,
          city: store.City || null,
          organizationId: organizationId,
        },
      });
      storeMap[store.Store_ID] = created.id;
    }
    console.log("✅ Stores migrated:", Object.keys(storeMap).length);

    /*
    =========================================
    2️⃣ INSERT SKUs
    =========================================
    */
    for (const sku of skus) {
      const created = await prisma.sKU.upsert({
        where: { externalId: sku.SKU_ID },
        update: {},
        create: {
          externalId: sku.SKU_ID,
          category: sku.Category || "General",
          mrp: Number(sku.MRP || 0),
          condition: sku.Condition || null,
          acquisitionCost: Number(sku.Acquisition_Cost || 0),
          refurbCost: Number(sku.Refurb_Cost || 0),
        },
      });
      skuMap[sku.SKU_ID] = created.id;
    }
    console.log("✅ SKUs migrated:", Object.keys(skuMap).length);

    /*
    =========================================
    3️⃣ INSERT TRANSACTIONS
    =========================================
    */
    let txCount = 0;
    for (const tx of transactions) {
      await prisma.transaction.upsert({
        where: { externalId: tx.Transaction_ID },
        update: {},
        create: {
          externalId: tx.Transaction_ID,
          storeId: storeMap[tx.Store_ID],
          skuId: skuMap[tx.SKU_ID],
          organizationId: organizationId,
          date: new Date(tx.Date),
          quantity: Number(tx.Units_Saleable || 1),
          sellingPriceGst: Number(tx.Selling_Price_GST || 0),
          netRevenue: Number(tx.Net_Revenue || 0),
          cogs: Number(tx.COGS || 0),
          grossMarginPct: Number(tx.True_Gross_Margin_percent || 0),
          inventoryAgeBucket: tx.Inventory_Age_Bucket || "0-30",
        },
      });
      txCount++;
      if (txCount % 500 === 0) console.log(`  ...${txCount} transactions inserted`);
    }
    console.log("✅ Transactions migrated:", txCount);

    /*
    =========================================
    4️⃣ INSERT INVENTORY
    =========================================
    */
    let invCount = 0;
    for (const item of inventoryData) {
      await prisma.inventory.upsert({
        where: {
          storeId_skuId: {
            storeId: storeMap[item.Store_ID],
            skuId: skuMap[item.SKU_ID],
          },
        },
        update: {},
        create: {
          storeId: storeMap[item.Store_ID],
          skuId: skuMap[item.SKU_ID],
          organizationId: organizationId,
          unitsAcquired: item.Units_Acquired,
          unitsSaleable: item.Units_Saleable,
          stockAgeDays: item.Stock_Age_Days,
        },
      });
      invCount++;
    }
    console.log("✅ Inventory migrated:", invCount);

    console.log("\n🎉 Migration complete!");
    console.log("Organization ID:", organizationId);
    console.log("⚠️  Save this Organization ID — your User accounts need it!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();