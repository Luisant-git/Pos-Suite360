const fs = require('fs');

// Patch create-purchase.dto.ts
const dtoPath = 'd:/Pos-Nasa Fresh Mart/backend/src/purchases/dto/create-purchase.dto.ts';
let dtoContent = fs.readFileSync(dtoPath, 'utf8');
if (!dtoContent.includes('noOfBirds?: number;')) {
  dtoContent = dtoContent.replace(
    '  @IsNumber()\n  quantity: number;',
    '  @IsNumber()\n  quantity: number;\n\n  @IsNumber()\n  @IsOptional()\n  noOfBirds?: number;'
  );
  fs.writeFileSync(dtoPath, dtoContent);
}

// Patch purchases.service.ts
const purPath = 'd:/Pos-Nasa Fresh Mart/backend/src/purchases/purchases.service.ts';
let purContent = fs.readFileSync(purPath, 'utf8');

// 1. purchase.create items
purContent = purContent.replace(/quantity: item\.quantity,/g, 'quantity: item.quantity,\n              noOfBirds: item.noOfBirds || 0,');

// 2. product.update currentStock -> currentStock & currentBirds
purContent = purContent.replace(/currentStock: \{ increment: item\.quantity \},/g, 'currentStock: { increment: item.quantity },\n            currentBirds: { increment: item.noOfBirds || 0 },');
purContent = purContent.replace(/currentStock: \{ decrement: item\.quantity \},/g, 'currentStock: { decrement: item.quantity },\n            currentBirds: { decrement: item.noOfBirds || 0 },');

// 3. stockTransaction.create
purContent = purContent.replace(/quantityIn: item\.quantity,\n\s*quantityOut: 0,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: item.quantity,\n            quantityOut: 0,\n            balance: updatedProduct.currentStock,\n            birdsIn: item.noOfBirds || 0,\n            birdsOut: 0,\n            birdsBalance: updatedProduct.currentBirds,');

// stockTransaction.create for returns (remove/update)
// for remove():
//             quantityIn: 0,
//             quantityOut: item.quantity,
//             balance: updatedProduct.currentStock,
purContent = purContent.replace(/quantityIn: 0,\n\s*quantityOut: item\.quantity,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: 0,\n            quantityOut: item.quantity,\n            balance: updatedProduct.currentStock,\n            birdsIn: 0,\n            birdsOut: item.noOfBirds || 0,\n            birdsBalance: updatedProduct.currentBirds,');

// stockTransaction.create for update old items (remove):
purContent = purContent.replace(/quantityIn: 0,\n\s*quantityOut: oldItem\.quantity,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: 0,\n            quantityOut: oldItem.quantity,\n            balance: updatedProduct.currentStock,\n            birdsIn: 0,\n            birdsOut: oldItem.noOfBirds || 0,\n            birdsBalance: updatedProduct.currentBirds,');
purContent = purContent.replace(/currentStock: \{ decrement: oldItem\.quantity \},/g, 'currentStock: { decrement: oldItem.quantity },\n            currentBirds: { decrement: oldItem.noOfBirds || 0 },');

fs.writeFileSync(purPath, purContent);


// Patch sales.service.ts
const salPath = 'd:/Pos-Nasa Fresh Mart/backend/src/sales/sales.service.ts';
let salContent = fs.readFileSync(salPath, 'utf8');

// Note: saleItem already has noOfBirds in schema and DTO, and in create() it uses `noOfBirds: item.noOfBirds || 0,`
// 2. product.update
salContent = salContent.replace(/currentStock: \{ decrement: item\.quantity \},/g, 'currentStock: { decrement: item.quantity },\n            currentBirds: { decrement: item.noOfBirds || 0 },');
salContent = salContent.replace(/currentStock: \{ increment: item\.quantity \},/g, 'currentStock: { increment: item.quantity },\n            currentBirds: { increment: item.noOfBirds || 0 },');
salContent = salContent.replace(/currentStock: \{ decrement: oldItem\.quantity \},/g, 'currentStock: { decrement: oldItem.quantity },\n            currentBirds: { decrement: oldItem.noOfBirds || 0 },');
salContent = salContent.replace(/currentStock: \{ increment: oldItem\.quantity \},/g, 'currentStock: { increment: oldItem.quantity },\n            currentBirds: { increment: oldItem.noOfBirds || 0 },');

// 3. stockTransaction.create
salContent = salContent.replace(/quantityIn: 0,\n\s*quantityOut: item\.quantity,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: 0,\n            quantityOut: item.quantity,\n            balance: updatedProduct.currentStock,\n            birdsIn: 0,\n            birdsOut: item.noOfBirds || 0,\n            birdsBalance: updatedProduct.currentBirds,');

// for sale return (remove)
salContent = salContent.replace(/quantityIn: item\.quantity,\n\s*quantityOut: 0,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: item.quantity,\n            quantityOut: 0,\n            balance: updatedProduct.currentStock,\n            birdsIn: item.noOfBirds || 0,\n            birdsOut: 0,\n            birdsBalance: updatedProduct.currentBirds,');

// for update oldItem
salContent = salContent.replace(/quantityIn: oldItem\.quantity,\n\s*quantityOut: 0,\n\s*balance: updatedProduct\.currentStock,/g, 'quantityIn: oldItem.quantity,\n            quantityOut: 0,\n            balance: updatedProduct.currentStock,\n            birdsIn: oldItem.noOfBirds || 0,\n            birdsOut: 0,\n            birdsBalance: updatedProduct.currentBirds,');

fs.writeFileSync(salPath, salContent);

console.log('Backend patched successfully');
