"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function test() {
    const lastPurchase = await prisma.purchase.findFirst({
        orderBy: { id: 'desc' },
        select: { invoiceNo: true },
    });
    console.log("lastPurchase:", lastPurchase);
}
test().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=test-entry.js.map