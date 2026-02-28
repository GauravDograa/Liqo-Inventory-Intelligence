require("dotenv").config();
const prisma = require("../src/config/prisma");

async function checkInventoryPerStore() {
  const stores = await prisma.store.findMany({
    include: { inventory: true }
  });

  for (const store of stores) {
    console.log(store.name, "Inventory count:", store.inventory.length);
  }

  await prisma.$disconnect();
}

checkInventoryPerStore();
