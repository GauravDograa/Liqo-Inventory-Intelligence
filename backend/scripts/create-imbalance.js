require("dotenv").config();
const prisma = require("../src/config/prisma");

async function createImbalance() {

  const stores = await prisma.store.findMany({
    include: { inventory: true }
  });

  const demandStores = stores.slice(0, 2);
  const surplusStores = stores.slice(2, 4);

  for (const store of demandStores) {
    for (const inv of store.inventory) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { unitsSaleable: 1 }
      });
    }
    console.log("Updated demand store:", store.name);
  }

  for (const store of surplusStores) {
    for (const inv of store.inventory) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { unitsSaleable: 20 }
      });
    }
    console.log("Updated surplus store:", store.name);
  }

  console.log("Imbalance created.");
  await prisma.$disconnect();
}

createImbalance();
