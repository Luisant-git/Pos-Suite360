const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    connectionString = envConfig.DATABASE_URL;
  }
}
connectionString = connectionString.replace(/^"|"$/g, '');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkInvoices() {
  const sales = await prisma.sale.findMany({
    select: { id: true, invoiceNo: true },
    orderBy: { id: 'desc' },
    take: 20
  });
  
  console.log(JSON.stringify(sales, null, 2));
}

checkInvoices()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
