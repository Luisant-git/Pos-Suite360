const fs = require('fs');

// 1. StockReport.tsx
let stockPath = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/StockReport.tsx';
let stockContent = fs.readFileSync(stockPath, 'utf8');

// Map
stockContent = stockContent.replace(/currentQty: `\$\{p\.currentStock\}/g, 'currentBirds: p.currentBirds || 0,\n        currentQty: `${p.currentStock}');
// PDF
stockContent = stockContent.replace(/\{ header: 'Current Qty', dataKey: 'currentQty' \}/g, '{ header: \'Current Birds\', dataKey: \'currentBirds\' },\n                  { header: \'Current Qty\', dataKey: \'currentQty\' }');
stockContent = stockContent.replace(/currentQty: '',\n\s*purRate:/g, 'currentBirds: \'\',\n                  currentQty: \'\',\n                  purRate:');
// Excel
stockContent = stockContent.replace(/'Current Qty': p\.currentQty,/g, '\'Current Birds\': p.currentBirds,\n                  \'Current Qty\': p.currentQty,');
stockContent = stockContent.replace(/'Current Qty': '',\n\s*'Pur Rate':/g, '\'Current Birds\': \'\',\n                  \'Current Qty\': \'\',\n                  \'Pur Rate\':');
// Headers
stockContent = stockContent.replace(/<th className="px-4 py-3 border-r border-\[#1E293B\] text-right">Current Qty<\/th>/g, '<th className="px-4 py-3 border-r border-[#1E293B] text-right">Birds</th>\n                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Current Qty</th>');
// Cells
stockContent = stockContent.replace(/<td className="px-4 py-3 border-r border-\[#E2E8F0\] text-right font-bold text-black font-bold">\{p\.currentQty\}<\/td>/g, '<td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.currentBirds}</td>\n                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right font-bold text-black font-bold">{p.currentQty}</td>');

fs.writeFileSync(stockPath, stockContent);
console.log('StockReport patched');


// Helper function for Purchase and Sales reports
function patchInvoiceReport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Map
  content = content.replace(/netAmount: formatCurrency\(p\.grandTotal\),/g, 'netAmount: formatCurrency(p.grandTotal),\n        totalBirds: p.items?.reduce((sum: number, i: any) => sum + (Number(i.noOfBirds) || 0), 0) || 0,');
  
  // PDF
  content = content.replace(/\{ header: 'Total Amount', dataKey: 'totalAmount' \}/g, '{ header: \'Total Birds\', dataKey: \'totalBirds\' },\n                  { header: \'Total Amount\', dataKey: \'totalAmount\' }');
  // the empty row for PDF
  content = content.replace(/totalAmount: 'TOTAL:',/g, 'totalBirds: \'\',\n                  totalAmount: \'TOTAL:\',');
  
  // Excel
  content = content.replace(/'Total Amount': p\.totalAmount,/g, '\'Total Birds\': p.totalBirds,\n                  \'Total Amount\': p.totalAmount,');
  content = content.replace(/'Total Amount': 'TOTAL:',/g, '\'Total Birds\': \'\',\n                  \'Total Amount\': \'TOTAL:\',');
  
  // Headers
  content = content.replace(/<th className="px-4 py-3 border-r border-\[#1E293B\] text-right">Total Amount<\/th>/g, '<th className="px-4 py-3 border-r border-[#1E293B] text-right">Birds</th>\n                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Total Amount</th>');
  
  // Cells
  content = content.replace(/<td className="px-4 py-3 border-r border-\[#E2E8F0\] text-right text-black font-bold">\{p\.totalAmount\}<\/td>/g, '<td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.totalBirds}</td>\n                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.totalAmount}</td>');

  fs.writeFileSync(filePath, content);
  console.log(filePath + ' patched');
}

patchInvoiceReport('d:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/PurchaseReport.tsx');
patchInvoiceReport('d:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/SalesReport.tsx');
