const { Pool } = require('pg'); 
const { PrismaPg } = require('@prisma/adapter-pg'); 
const { PrismaClient } = require('@prisma/client'); 

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/pos-suite360?schema=public' }); 
const adapter = new PrismaPg(pool); 
const prisma = new PrismaClient({ adapter }); 

prisma.product.updateMany({ 
  where: { code: 'P1001' }, 
  data: { code: 'P000001' } 
})
  .then(console.log)
  .finally(() => prisma.$disconnect());
