require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL.replace(/^"|"$/g, '') });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting product code update...');
  
  const products = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('Found ' + products.length + ' products to update.');

  for (const product of products) {
    const paddedId = String(product.id).padStart(4, '0');
    const newCode = 'PROD-' + paddedId;

    if (product.code !== newCode) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { code: newCode }
        });
        console.log('Updated product ID ' + product.id + ' code: ' + product.code + ' -> ' + newCode);
      } catch (error) {
        console.error('Failed to update product ID ' + product.id + ':', error.message);
      }
    } else {
      console.log('Product ID ' + product.id + ' already has correct code: ' + product.code);
    }
  }

  console.log('Product code update completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
