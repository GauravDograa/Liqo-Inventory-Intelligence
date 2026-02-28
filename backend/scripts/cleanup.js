require("dotenv").config();
const prisma = require("../src/config/prisma");

async function cleanup() {
  console.log("Deleting old data...");

  await prisma.inventory.deleteMany();
  await prisma.transaction.deleteMany();

  console.log("Old transactions and inventory deleted.");

  await prisma.$disconnect();
}

cleanup();
