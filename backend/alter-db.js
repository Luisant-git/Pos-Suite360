const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to database:", process.env.DATABASE_URL.split('@')[1]);

    const queries = [
      'ALTER TABLE "Product" ALTER COLUMN "minStock" TYPE DECIMAL(65,30) USING "minStock"::numeric',
      'ALTER TABLE "Product" ALTER COLUMN "reorderLevel" TYPE DECIMAL(65,30) USING "reorderLevel"::numeric',
      'ALTER TABLE "Product" ALTER COLUMN "currentStock" TYPE DECIMAL(65,30) USING "currentStock"::numeric',
      
      'ALTER TABLE "PurchaseItem" ALTER COLUMN "quantity" TYPE DECIMAL(65,30) USING "quantity"::numeric',
      'ALTER TABLE "PurchaseReturnItem" ALTER COLUMN "returnQty" TYPE DECIMAL(65,30) USING "returnQty"::numeric',
      
      'ALTER TABLE "SaleItem" ALTER COLUMN "quantity" TYPE DECIMAL(65,30) USING "quantity"::numeric',
      'ALTER TABLE "SalesReturnItem" ALTER COLUMN "returnQty" TYPE DECIMAL(65,30) USING "returnQty"::numeric',
      
      'ALTER TABLE "StockTransaction" ALTER COLUMN "quantityIn" TYPE DECIMAL(65,30) USING "quantityIn"::numeric',
      'ALTER TABLE "StockTransaction" ALTER COLUMN "quantityOut" TYPE DECIMAL(65,30) USING "quantityOut"::numeric',
      'ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "allowEditSaleInvoice" BOOLEAN NOT NULL DEFAULT false',
      'ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "enableCustomerRates" BOOLEAN NOT NULL DEFAULT false',
      `CREATE TABLE IF NOT EXISTS "CustomerProductRate" (
        "id" SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
        "productId" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
        "rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CustomerProductRate_customerId_productId_key" UNIQUE ("customerId", "productId")
      )`,
    ];

    for (const query of queries) {
      console.log('Executing:', query);
      await client.query(query);
    }
    
    console.log("All columns successfully converted to DECIMAL! Existing data is preserved.");
    
  } catch (error) {
    console.error("Error running query:", error);
  } finally {
    await client.end();
  }
}

run();
