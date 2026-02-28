console.log("USING CLEAN SCHEMA-ALIGNED SCRIPT");

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
        }
      });


      storeMap[store.Store_ID] = created.id;
    }

    console.log("Stores migrated");

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
        }
      });


      skuMap[sku.SKU_ID] = created.id;
    }

    console.log("SKUs migrated");

    /*
    =========================================
    3️⃣ INSERT TRANSACTIONS
    =========================================
    */
    for (const tx of transactions) {
      await prisma.transaction.create({
        data: {
          externalId: tx.Transaction_ID,
          storeId: storeMap[tx.Store_ID],
          skuId: skuMap[tx.SKU_ID],
          date: new Date(tx.Date),

          quantity: Number(tx.Units_Saleable || 1), // ✅ THIS IS CRITICAL

          sellingPriceGst: Number(tx.Selling_Price_GST || 0),
          netRevenue: Number(tx.Net_Revenue || 0),
          cogs: Number(tx.COGS || 0),
          grossMarginPct: Number(tx.True_Gross_Margin_percent || 0),
          inventoryAgeBucket: tx.Inventory_Age_Bucket || "0-30"
        }
      });

    }

    console.log("Transactions migrated");

    /*
    =========================================
    4️⃣ INSERT INVENTORY
    =========================================
    */
    for (const item of inventoryData) {
      await prisma.inventory.create({
        data: {
          storeId: storeMap[item.Store_ID],
          skuId: skuMap[item.SKU_ID],
          unitsAcquired: item.Units_Acquired,
          unitsSaleable: item.Units_Saleable,
          stockAgeDays: item.Stock_Age_Days,
        },
      });
    }

    console.log("Inventory migrated");
    console.log("Migration complete ✅");
  } catch (err) {
    console.error("Migration failed ❌", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
