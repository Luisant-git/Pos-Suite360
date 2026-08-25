const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const modes = await prisma.paymentMode.findMany();
  console.log('PaymentModes:', modes);
  const purchases = await prisma.purchase.findMany({ include: { paymentMode: true } });
  console.log('Purchases:', purchases.map(p => ({ inv: p.invoiceNo, mode: p.paymentMode })));
}
run();
