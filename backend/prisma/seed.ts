import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const organizationId = "seed-org-liqo-retail";

type StoreSeed = {
  code: string;
  name: string;
  gstin: string;
  region: string;
  city: string;
  state: string;
  country: string;
};

type BrandSeed = {
  code: string;
  name: string;
};

type CategorySeed = {
  code: string;
  name: string;
};

type ProductSeed = {
  sku: string;
  barcode: string;
  name: string;
  brandCode: string;
  categoryCode: string;
  hsnCode: string;
  gstRate: number;
  baseCost: number;
  mrp: number;
};

type CustomerSeed = {
  customerNumber: string;
  name: string;
  email: string;
  phone: string;
  gstin: string | null;
  billingAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
};

type InventorySeed = {
  quantityAvailable: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  safetyStockLevel?: number;
};

const toMap = <TRecord, TKey extends string | number>(
  records: TRecord[],
  getKey: (record: TRecord) => TKey
) => new Map(records.map((record) => [getKey(record), record]));

const buildInventoryPolicy = (seed: InventorySeed) => ({
  quantityOnHand: seed.quantityAvailable,
  quantityReserved: 0,
  quantityAvailable: seed.quantityAvailable,
  reorderLevel:
    seed.reorderLevel ?? Math.max(3, Math.floor(seed.quantityAvailable * 0.25)),
  reorderQuantity:
    seed.reorderQuantity ?? Math.max(5, Math.floor(seed.quantityAvailable * 0.5)),
  safetyStockLevel:
    seed.safetyStockLevel ?? Math.max(2, Math.floor(seed.quantityAvailable * 0.15)),
  lastStocktakeAt: new Date(),
});

const stores: StoreSeed[] = [
  {
    code: "LIQO-CHD-001",
    name: "LIQO Chandigarh",
    gstin: "04ABCDE1234F1Z2",
    region: "Tricity",
    city: "Chandigarh",
    state: "Chandigarh",
    country: "IN",
  },
  {
    code: "LIQO-PKL-001",
    name: "LIQO Panchkula",
    gstin: "06ABCDE1234F1Z8",
    region: "Tricity",
    city: "Panchkula",
    state: "Haryana",
    country: "IN",
  },
  {
    code: "LIQO-KHR-001",
    name: "LIQO Kharar",
    gstin: "03ABCDE1234F1Z6",
    region: "Punjab East",
    city: "Kharar",
    state: "Punjab",
    country: "IN",
  },
  {
    code: "LIQO-LDH-001",
    name: "LIQO Ludhiana",
    gstin: "03ABCDE1234F2Z5",
    region: "Punjab Central",
    city: "Ludhiana",
    state: "Punjab",
    country: "IN",
  },
  {
    code: "LIQO-PTL-001",
    name: "LIQO Patiala",
    gstin: "03ABCDE1234F3Z4",
    region: "Punjab South",
    city: "Patiala",
    state: "Punjab",
    country: "IN",
  },
];

const brands: BrandSeed[] = [
  { code: "SAMSUNG", name: "Samsung" },
  { code: "LG", name: "LG" },
  { code: "SONY", name: "Sony" },
  { code: "MI", name: "MI" },
];

const categories: CategorySeed[] = [
  { code: "TV", name: "TVs" },
  { code: "AC", name: "ACs" },
  { code: "REFRIGERATOR", name: "Refrigerators" },
  { code: "WASHING-MACHINE", name: "Washing Machines" },
  { code: "KITCHEN-APPLIANCE", name: "Kitchen Appliances" },
];

const products: ProductSeed[] = [
  {
    sku: "SAM-TV-55-Q60D",
    barcode: "8904235701001",
    name: "Samsung 55 inch QLED 4K Smart TV Q60D",
    brandCode: "SAMSUNG",
    categoryCode: "TV",
    hsnCode: "85287219",
    gstRate: 18,
    baseCost: 52000,
    mrp: 68990,
  },
  {
    sku: "SAM-AC-1.5T-WIND-FREE",
    barcode: "8904235701002",
    name: "Samsung 1.5 Ton 5 Star WindFree Split AC",
    brandCode: "SAMSUNG",
    categoryCode: "AC",
    hsnCode: "84151010",
    gstRate: 18,
    baseCost: 39500,
    mrp: 52990,
  },
  {
    sku: "LG-TV-48-OLED-C4",
    barcode: "8904235701003",
    name: "LG 48 inch OLED evo C4 Smart TV",
    brandCode: "LG",
    categoryCode: "TV",
    hsnCode: "85287219",
    gstRate: 18,
    baseCost: 85000,
    mrp: 119990,
  },
  {
    sku: "LG-REF-260L-FF",
    barcode: "8904235701004",
    name: "LG 260L Frost Free Double Door Refrigerator",
    brandCode: "LG",
    categoryCode: "REFRIGERATOR",
    hsnCode: "84181090",
    gstRate: 18,
    baseCost: 25500,
    mrp: 34990,
  },
  {
    sku: "SONY-TV-55-X82L",
    barcode: "8904235701005",
    name: "Sony Bravia 55 inch 4K Ultra HD Smart LED TV",
    brandCode: "SONY",
    categoryCode: "TV",
    hsnCode: "85287219",
    gstRate: 18,
    baseCost: 59000,
    mrp: 74990,
  },
  {
    sku: "SONY-KITCHEN-MWO-25L",
    barcode: "8904235701006",
    name: "Sony 25L Convection Microwave Oven",
    brandCode: "SONY",
    categoryCode: "KITCHEN-APPLIANCE",
    hsnCode: "85165000",
    gstRate: 18,
    baseCost: 13800,
    mrp: 21990,
  },
  {
    sku: "SAM-WM-8KG-ECOBUBBLE",
    barcode: "8904235701007",
    name: "Samsung 8kg EcoBubble Front Load Washing Machine",
    brandCode: "SAMSUNG",
    categoryCode: "WASHING-MACHINE",
    hsnCode: "84501100",
    gstRate: 18,
    baseCost: 31500,
    mrp: 44990,
  },
  {
    sku: "MI-TV-43-X-PRO",
    barcode: "8904235701008",
    name: "MI 43 inch X Pro 4K Smart TV",
    brandCode: "MI",
    categoryCode: "TV",
    hsnCode: "85287219",
    gstRate: 18,
    baseCost: 23500,
    mrp: 32999,
  },
  {
    sku: "MI-AC-1.5T-5S",
    barcode: "8904235701009",
    name: "MI 1.5 Ton 5 Star Inverter Split AC",
    brandCode: "MI",
    categoryCode: "AC",
    hsnCode: "84151010",
    gstRate: 18,
    baseCost: 32500,
    mrp: 46999,
  },
  {
    sku: "LG-WM-7KG-FL",
    barcode: "8904235701010",
    name: "LG 7kg Front Load Washing Machine",
    brandCode: "LG",
    categoryCode: "WASHING-MACHINE",
    hsnCode: "84501100",
    gstRate: 18,
    baseCost: 28000,
    mrp: 39990,
  },
  {
    sku: "SAM-REF-633L-SBS",
    barcode: "8904235701011",
    name: "Samsung 633L Side-by-Side Refrigerator",
    brandCode: "SAMSUNG",
    categoryCode: "REFRIGERATOR",
    hsnCode: "84181090",
    gstRate: 18,
    baseCost: 76000,
    mrp: 104990,
  },
  {
    sku: "LG-KITCHEN-DW-14PS",
    barcode: "8904235701012",
    name: "LG 14 Place Settings Dishwasher",
    brandCode: "LG",
    categoryCode: "KITCHEN-APPLIANCE",
    hsnCode: "84221100",
    gstRate: 18,
    baseCost: 36500,
    mrp: 52990,
  },
];

const customers: CustomerSeed[] = [
  {
    customerNumber: "LIQO-CUST-CHD-0001",
    name: "Gurpreet Singh",
    email: "gurpreet.singh@example.com",
    phone: "+919815001001",
    gstin: null,
    billingAddress: {
      line1: "House 214, Sector 35C",
      city: "Chandigarh",
      state: "Chandigarh",
      pincode: "160022",
    },
  },
  {
    customerNumber: "LIQO-CUST-PKL-0001",
    name: "Simran Kaur",
    email: "simran.kaur@example.com",
    phone: "+919815001002",
    gstin: "06AAXCS2301B1Z4",
    billingAddress: {
      line1: "SCO 18, Sector 11",
      city: "Panchkula",
      state: "Haryana",
      pincode: "134109",
    },
  },
  {
    customerNumber: "LIQO-CUST-KHR-0001",
    name: "Amanpreet Gill",
    email: "amanpreet.gill@example.com",
    phone: "+919815001003",
    gstin: null,
    billingAddress: {
      line1: "Flat 302, Sunny Enclave",
      city: "Kharar",
      state: "Punjab",
      pincode: "140301",
    },
  },
  {
    customerNumber: "LIQO-CUST-LDH-0001",
    name: "Neha Bansal",
    email: "neha.bansal@example.com",
    phone: "+919815001004",
    gstin: "03AAQFN4522K1Z9",
    billingAddress: {
      line1: "B-34, Model Town",
      city: "Ludhiana",
      state: "Punjab",
      pincode: "141002",
    },
  },
  {
    customerNumber: "LIQO-CUST-PTL-0001",
    name: "Harnoor Brar",
    email: "harnoor.brar@example.com",
    phone: "+919815001005",
    gstin: null,
    billingAddress: {
      line1: "88, Leela Bhawan",
      city: "Patiala",
      state: "Punjab",
      pincode: "147001",
    },
  },
];

const inventoryPlan: Record<string, Record<string, InventorySeed>> = {
  "LIQO-CHD-001": {
    "SAM-TV-55-Q60D": { quantityAvailable: 14 },
    "SAM-AC-1.5T-WIND-FREE": { quantityAvailable: 9 },
    "LG-TV-48-OLED-C4": { quantityAvailable: 3, reorderLevel: 4, reorderQuantity: 8, safetyStockLevel: 2 },
    "LG-REF-260L-FF": { quantityAvailable: 11 },
    "SONY-TV-55-X82L": { quantityAvailable: 7 },
    "SONY-KITCHEN-MWO-25L": { quantityAvailable: 21 },
    "SAM-WM-8KG-ECOBUBBLE": { quantityAvailable: 6 },
    "MI-TV-43-X-PRO": { quantityAvailable: 28, reorderLevel: 6, reorderQuantity: 12, safetyStockLevel: 4 },
    "MI-AC-1.5T-5S": { quantityAvailable: 8 },
    "LG-WM-7KG-FL": { quantityAvailable: 5 },
    "SAM-REF-633L-SBS": { quantityAvailable: 2, reorderLevel: 3, reorderQuantity: 5, safetyStockLevel: 2 },
    "LG-KITCHEN-DW-14PS": { quantityAvailable: 4 },
  },
  "LIQO-PKL-001": {
    "SAM-TV-55-Q60D": { quantityAvailable: 8 },
    "SAM-AC-1.5T-WIND-FREE": { quantityAvailable: 2, reorderLevel: 4, reorderQuantity: 8, safetyStockLevel: 2 },
    "LG-TV-48-OLED-C4": { quantityAvailable: 4 },
    "LG-REF-260L-FF": { quantityAvailable: 15 },
    "SONY-TV-55-X82L": { quantityAvailable: 5 },
    "SONY-KITCHEN-MWO-25L": { quantityAvailable: 7 },
    "SAM-WM-8KG-ECOBUBBLE": { quantityAvailable: 16 },
    "MI-TV-43-X-PRO": { quantityAvailable: 19 },
    "MI-AC-1.5T-5S": { quantityAvailable: 5 },
    "LG-WM-7KG-FL": { quantityAvailable: 3, reorderLevel: 4, reorderQuantity: 8, safetyStockLevel: 2 },
    "SAM-REF-633L-SBS": { quantityAvailable: 4 },
    "LG-KITCHEN-DW-14PS": { quantityAvailable: 2, reorderLevel: 3, reorderQuantity: 5, safetyStockLevel: 2 },
  },
  "LIQO-KHR-001": {
    "SAM-TV-55-Q60D": { quantityAvailable: 5 },
    "SAM-AC-1.5T-WIND-FREE": { quantityAvailable: 6 },
    "LG-TV-48-OLED-C4": { quantityAvailable: 2, reorderLevel: 3, reorderQuantity: 6, safetyStockLevel: 2 },
    "LG-REF-260L-FF": { quantityAvailable: 9 },
    "SONY-TV-55-X82L": { quantityAvailable: 3, reorderLevel: 4, reorderQuantity: 7, safetyStockLevel: 2 },
    "SONY-KITCHEN-MWO-25L": { quantityAvailable: 16 },
    "SAM-WM-8KG-ECOBUBBLE": { quantityAvailable: 7 },
    "MI-TV-43-X-PRO": { quantityAvailable: 31, reorderLevel: 7, reorderQuantity: 14, safetyStockLevel: 5 },
    "MI-AC-1.5T-5S": { quantityAvailable: 4 },
    "LG-WM-7KG-FL": { quantityAvailable: 6 },
    "SAM-REF-633L-SBS": { quantityAvailable: 3 },
    "LG-KITCHEN-DW-14PS": { quantityAvailable: 5 },
  },
  "LIQO-LDH-001": {
    "SAM-TV-55-Q60D": { quantityAvailable: 18 },
    "SAM-AC-1.5T-WIND-FREE": { quantityAvailable: 12 },
    "LG-TV-48-OLED-C4": { quantityAvailable: 6 },
    "LG-REF-260L-FF": { quantityAvailable: 22, reorderLevel: 5, reorderQuantity: 11, safetyStockLevel: 4 },
    "SONY-TV-55-X82L": { quantityAvailable: 8 },
    "SONY-KITCHEN-MWO-25L": { quantityAvailable: 26, reorderLevel: 6, reorderQuantity: 13, safetyStockLevel: 4 },
    "SAM-WM-8KG-ECOBUBBLE": { quantityAvailable: 12 },
    "MI-TV-43-X-PRO": { quantityAvailable: 34, reorderLevel: 8, reorderQuantity: 16, safetyStockLevel: 5 },
    "MI-AC-1.5T-5S": { quantityAvailable: 10 },
    "LG-WM-7KG-FL": { quantityAvailable: 9 },
    "SAM-REF-633L-SBS": { quantityAvailable: 5 },
    "LG-KITCHEN-DW-14PS": { quantityAvailable: 8 },
  },
  "LIQO-PTL-001": {
    "SAM-TV-55-Q60D": { quantityAvailable: 6 },
    "SAM-AC-1.5T-WIND-FREE": { quantityAvailable: 4 },
    "LG-TV-48-OLED-C4": { quantityAvailable: 2, reorderLevel: 3, reorderQuantity: 6, safetyStockLevel: 2 },
    "LG-REF-260L-FF": { quantityAvailable: 8 },
    "SONY-TV-55-X82L": { quantityAvailable: 4 },
    "SONY-KITCHEN-MWO-25L": { quantityAvailable: 11 },
    "SAM-WM-8KG-ECOBUBBLE": { quantityAvailable: 5 },
    "MI-TV-43-X-PRO": { quantityAvailable: 24, reorderLevel: 6, reorderQuantity: 12, safetyStockLevel: 4 },
    "MI-AC-1.5T-5S": { quantityAvailable: 2, reorderLevel: 4, reorderQuantity: 8, safetyStockLevel: 2 },
    "LG-WM-7KG-FL": { quantityAvailable: 4 },
    "SAM-REF-633L-SBS": { quantityAvailable: 2, reorderLevel: 3, reorderQuantity: 6, safetyStockLevel: 2 },
    "LG-KITCHEN-DW-14PS": { quantityAvailable: 3 },
  },
};

const upsertOrganization = () =>
  prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "LIQO Retail" },
    create: {
      id: organizationId,
      name: "LIQO Retail",
    },
  });

const resetSeedOrganizationData = async () => {
  await prisma.payment.deleteMany({ where: { organizationId } });
  await prisma.invoice.deleteMany({ where: { organizationId } });
  await prisma.transactionItem.deleteMany({
    where: {
      transaction: {
        organizationId,
      },
    },
  });
  await prisma.retailTransaction.deleteMany({ where: { organizationId } });
  await prisma.retailInventory.deleteMany({ where: { organizationId } });
  await prisma.customer.deleteMany({ where: { organizationId } });
  await prisma.product.deleteMany({ where: { organizationId } });
  await prisma.category.deleteMany({ where: { organizationId } });
  await prisma.brand.deleteMany({ where: { organizationId } });
  await prisma.retailStore.deleteMany({ where: { organizationId } });
};

const seedStores = async () => {
  const records = await Promise.all(
    stores.map((store) =>
      prisma.retailStore.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: store.code,
          },
        },
        update: store,
        create: {
          ...store,
          organizationId,
        },
      })
    )
  );

  return toMap(records, (store) => store.code);
};

const seedBrands = async () => {
  const records = await Promise.all(
    brands.map((brand) =>
      prisma.brand.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: brand.code,
          },
        },
        update: { name: brand.name, status: "ACTIVE" },
        create: {
          ...brand,
          organizationId,
          status: "ACTIVE",
        },
      })
    )
  );

  return toMap(records, (brand) => brand.code!);
};

const seedCategories = async () => {
  const records = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: category.code,
          },
        },
        update: { name: category.name, status: "ACTIVE" },
        create: {
          ...category,
          organizationId,
          status: "ACTIVE",
        },
      })
    )
  );

  return toMap(records, (category) => category.code!);
};

const seedProducts = async (
  brandByCode: Awaited<ReturnType<typeof seedBrands>>,
  categoryByCode: Awaited<ReturnType<typeof seedCategories>>
) => {
  const records = await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: {
          organizationId_sku: {
            organizationId,
            sku: product.sku,
          },
        },
        update: {
          barcode: product.barcode,
          name: product.name,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate,
          baseCost: product.baseCost,
          mrp: product.mrp,
          status: "ACTIVE",
          brandId: brandByCode.get(product.brandCode)?.id,
          categoryId: categoryByCode.get(product.categoryCode)?.id,
        },
        create: {
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate,
          baseCost: product.baseCost,
          mrp: product.mrp,
          status: "ACTIVE",
          brandId: brandByCode.get(product.brandCode)?.id,
          categoryId: categoryByCode.get(product.categoryCode)?.id,
          organizationId,
        },
      })
    )
  );

  return toMap(records, (product) => product.sku);
};

const seedCustomers = async () => {
  await Promise.all(
    customers.map((customer) =>
      prisma.customer.upsert({
        where: {
          organizationId_customerNumber: {
            organizationId,
            customerNumber: customer.customerNumber,
          },
        },
        update: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          gstin: customer.gstin,
          billingAddress: customer.billingAddress,
          shippingAddress: customer.billingAddress,
          status: "ACTIVE",
        },
        create: {
          ...customer,
          shippingAddress: customer.billingAddress,
          organizationId,
          status: "ACTIVE",
        },
      })
    )
  );
};

const seedInventory = async (
  storeByCode: Awaited<ReturnType<typeof seedStores>>,
  productBySku: Awaited<ReturnType<typeof seedProducts>>
) => {
  for (const [storeCode, skuQuantities] of Object.entries(inventoryPlan)) {
    const store = storeByCode.get(storeCode);
    if (!store) {
      throw new Error(`Missing store for code ${storeCode}`);
    }

    for (const [sku, inventorySeed] of Object.entries(skuQuantities)) {
      const product = productBySku.get(sku);
      if (!product) {
        throw new Error(`Missing product for sku ${sku}`);
      }

      const inventoryPolicy = buildInventoryPolicy(inventorySeed);

      await prisma.retailInventory.upsert({
        where: {
          productId_storeId: {
            productId: product.id,
            storeId: store.id,
          },
        },
        update: inventoryPolicy,
        create: {
          productId: product.id,
          storeId: store.id,
          ...inventoryPolicy,
          organizationId,
        },
      });
    }
  }
};

const main = async () => {
  await upsertOrganization();
  await resetSeedOrganizationData();
  const storeByCode = await seedStores();
  const brandByCode = await seedBrands();
  const categoryByCode = await seedCategories();
  const productBySku = await seedProducts(brandByCode, categoryByCode);
  await seedCustomers();
  await seedInventory(storeByCode, productBySku);

  console.log("Retail ERP seed completed", {
    organizationId,
    stores: stores.length,
    brands: brands.length,
    categories: categories.length,
    products: products.length,
    customers: customers.length,
    inventoryRows: Object.values(inventoryPlan).reduce(
      (count, storeInventory) => count + Object.keys(storeInventory).length,
      0
    ),
  });
};

main()
  .catch((error) => {
    console.error("Retail ERP seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
