const fs = require('fs');
const file = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/PurchaseReport.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Map data
content = content.replace(
  /mode: p\.paymentMode\?\.name \|\| '-',/g,
  "mode: p.paymentMode?.name || '-',\n        noOfBirds: p.items?.reduce((sum: number, item: any) => sum + (Number(item.noOfBirds) || 0), 0) || 0,"
);

// 2. Export Excel
content = content.replace(
  /'Mode': p\.mode,/g,
  "'Mode': p.mode,\n                  'No. of Birds': p.noOfBirds,"
);
content = content.replace(
  /'Mode': '',\n\s*'Total Amount': 'TOTAL AMOUNT:',/g,
  "'Mode': '',\n                  'No. of Birds': '',\n                  'Total Amount': 'TOTAL AMOUNT:',"
);

// 3. Export PDF
content = content.replace(
  /\{ header: 'Mode', dataKey: 'mode' \},/g,
  "{ header: 'Mode', dataKey: 'mode' },\n                  { header: 'No. of Birds', dataKey: 'noOfBirds' },"
);
content = content.replace(
  /mode: '',\n\s*totalAmount: 'TOTAL AMOUNT:',/g,
  "mode: '',\n                  noOfBirds: '',\n                  totalAmount: 'TOTAL AMOUNT:',"
);

// 4. UI Header
content = content.replace(
  /<th className="px-4 py-3 border-r border-\[#1E293B\]">Mode<\/th>/g,
  '<th className="px-4 py-3 border-r border-[#1E293B]">Mode</th>\n                <th className="px-4 py-3 border-r border-[#1E293B] text-center">No. of Birds</th>'
);

// 5. UI Body
content = content.replace(
  /<\/span>\n\s*<\/div>\n\s*<\/td>\n\s*<td className="px-4 py-3 border-r border-\[#E2E8F0\] text-right font-bold text-\[#3B82F6\]">\{p\.totalAmount\}<\/td>/g,
  '</span>\n                      </div>\n                    </td>\n                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-center font-bold text-black font-bold">{p.noOfBirds}</td>\n                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right font-bold text-[#3B82F6]">{p.totalAmount}</td>'
);

// 6. Colspan & Loader
content = content.replace(
  /<TableLoader columns=\{9\} \/>/g,
  '<TableLoader columns={10} />'
);
content = content.replace(
  /<td colSpan=\{9\} /g,
  '<td colSpan={10} '
);

fs.writeFileSync(file, content, 'utf8');
