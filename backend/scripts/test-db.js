
const prisma = require('../src/config/prisma');

async function test() {
  const stores = await prisma.store.findMany();
  console.log(stores);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
