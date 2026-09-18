const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const fs = require('fs');
  if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    connectionString = envConfig.DATABASE_URL;
  }
}
connectionString = connectionString.replace(/^"|"$/g, '');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixInvoices() {
  const sales = await prisma.sale.findMany();
  
  let fixedCount = 0;
  for (const sale of sales) {
    if (sale.invoiceNo && sale.invoiceNo.includes('-2026-')) {
      const newInvoiceNo = sale.invoiceNo.replace('-2026-', '-');
      try {
        await prisma.sale.update({
          where: { id: sale.id },
          data: { invoiceNo: newInvoiceNo }
        });
        console.log(`Updated \${sale.invoiceNo} -> \${newInvoiceNo}`);
        fixedCount++;
      } catch (e) {
        console.error(`Error updating \${sale.invoiceNo}: \${e.message}`);
      }
    }
  }
  console.log(`Fixed \${fixedCount} invoices.`);
}

fixInvoices()
  .then(() => {
    console.log('Successfully completed script.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
