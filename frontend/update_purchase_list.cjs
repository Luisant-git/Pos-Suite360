const fs = require('fs');
const file = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/purchase/PurchaseList.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(
  /<th className="px-3 py-2\.5 border-r border-\[#444\] relative text-right">Total Amount \(₹\)<\/th>/g,
  '<th className="px-3 py-2.5 border-r border-[#444] relative text-center">No. of Birds</th>\n                <th className="px-3 py-2.5 border-r border-[#444] relative text-right">Total Amount (₹)</th>'
);

// Body
content = content.replace(
  /<td className="px-3 py-2\.5 border-r border-\[#E5E7EB\] text-\[#333\] font-bold text-right">\{formatCurrency\(purchase\.grandTotal\)\}<\/td>/g,
  '<td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#333] font-bold text-center">{purchase.items?.reduce((sum: number, item: any) => sum + (Number(item.noOfBirds) || 0), 0) || 0}</td>\n                    <td className="px-3 py-2.5 border-r border-[#E5E7EB] text-[#333] font-bold text-right">{formatCurrency(purchase.grandTotal)}</td>'
);

// Empty state colspan
content = content.replace(
  /<td colSpan=\{6\}/g,
  '<td colSpan={7}'
);
content = content.replace(
  /<TableLoader columns=\{6\} \/>/g,
  '<TableLoader columns={7} />'
);

fs.writeFileSync(file, content, 'utf8');
