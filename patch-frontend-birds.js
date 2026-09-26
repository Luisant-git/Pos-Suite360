const fs = require('fs');

const path = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/purchase/PurchaseEntry.tsx';
let content = fs.readFileSync(path, 'utf8');
const oldContent = content;

// 1. purchaseItemSchema
content = content.replace(
  /quantity: z\.coerce\.number\(\)\.min\(0\),/g,
  'quantity: z.coerce.number().min(0),\n  noOfBirds: z.union([z.coerce.number(), z.literal(\'\')]).optional(),'
);

// 2. defaultValues & append
content = content.replace(
  /quantity: '' as any, unit: 'Nos'/g,
  'quantity: \'\' as any, noOfBirds: \'\' as any, unit: \'Nos\''
);

// 3. reset useEffect
content = content.replace(
  /quantity: item\.quantity,\n\s*unit:/g,
  'quantity: item.quantity,\n          noOfBirds: item.noOfBirds || \'\',\n          unit:'
);

// 4. onSubmit payload
content = content.replace(
  /quantity: Number\(item\.quantity\) \|\| 0,\n\s*pRate:/g,
  'quantity: Number(item.quantity) || 0,\n        noOfBirds: Number(item.noOfBirds) || 0,\n        pRate:'
);

// 5. Table Header
content = content.replace(
  /<th className="px-2 py-2 text-center text-\[12px\] font-bold border border-\[#334155\] w-20">Qty<\/th>/g,
  '<th className="px-2 py-2 text-center text-[12px] font-bold border border-[#334155] w-16">Birds</th>\n                <th className="px-2 py-2 text-center text-[12px] font-bold border border-[#334155] w-20">Qty</th>'
);

// 6. Table Cell
// Find where Qty <td> is:
const qtyCellRegex = /<td data-label="Qty" className="px-2 py-1 border-r border-\[#E5E7EB\]">[\s\S]*?<input [\s\S]*?\{\.\.\.register\(`items\.\$\{index\}\.quantity`\)\}[\s\S]*?<\/td>/;
// Insert Birds <td> before it
content = content.replace(qtyCellRegex, (match) => {
  return `<td data-label="Birds" className="px-2 py-1 border-r border-[#E5E7EB]">
                    <input 
                      {...register(\`items.\${index}.noOfBirds\`)} 
                      data-row={index} data-col={1}
                      onKeyDown={(e) => handleCellKey(e, index, 1, 9)}
                      type="number" step="any" min="0" placeholder="0" 
                      onFocus={(e) => e.target.select()}
                      className="w-full px-2 py-1 border border-[#D1D5DB] rounded text-[13px] outline-none text-center transition-colors focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] focus:bg-blue-50" 
                    />
                  </td>\n                  ` + match.replace(/data-col=\{1\}/g, 'data-col={2}').replace(/index, 1, 8/g, 'index, 2, 9'); // need to adjust data-cols
});

// Since we added a column, data-cols for everything after Birds need to be shifted?
// Actually handleCellKey might not be strict about data-col matching the exact array index, but wait, the third arg is `colIndex`.
// Let's just do a simple replacement for the cell rendering and not worry about exact colIndex for handleCellKey if it's too hard to regex. 
// Actually, I can just use `patch-frontend-birds.js` with simple string replacement.

if (content !== oldContent) {
  fs.writeFileSync(path, content);
  console.log('PurchaseEntry patched');
} else {
  console.log('No changes in PurchaseEntry');
}

// ----------------------------------------------------
// Also need to patch PurchaseList and SalesList to show Birds? The user says "in both rpeots and stocks also added that bireds"
// Let's check what Reports and Stocks are.
// Reports: "d:\Pos-Nasa Fresh Mart\frontend\src\pages\reports\PurchaseReport.tsx"
// "d:\Pos-Nasa Fresh Mart\frontend\src\pages\reports\SalesReport.tsx"
// Stocks: "d:\Pos-Nasa Fresh Mart\frontend\src\pages\products\ProductList.tsx" (or Inventory/Stock component)

