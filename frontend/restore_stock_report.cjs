const fs = require('fs');
const file = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/StockReport.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Map data
content = content.replace(
  /categoryName: p\.category\?\.name \|\| '-',/g,
  "categoryName: p.category?.name || '-',\n        currentBirds: p.currentBirds || 0,"
);

// 2. Export Excel
content = content.replace(
  /'Category': p\.categoryName,/g,
  "'Category': p.categoryName,\n                  'Current Birds': p.currentBirds,"
);
content = content.replace(
  /'Category': '',/g,
  "'Category': '',\n                  'Current Birds': '',"
);

// 3. Export PDF
content = content.replace(
  /\{ header: 'Category', dataKey: 'categoryName' \},/g,
  "{ header: 'Category', dataKey: 'categoryName' },\n                  { header: 'Current Birds', dataKey: 'currentBirds' },"
);
content = content.replace(
  /categoryName: '',/g,
  "categoryName: '',\n                  currentBirds: '',"
);

// 4. UI Header
content = content.replace(
  /<th className="px-4 py-3 border-r border-\[#1E293B\]">Category<\/th>/g,
  '<th className="px-4 py-3 border-r border-[#1E293B]">Category</th>\n                <th className="px-4 py-3 border-r border-[#1E293B] text-right">Birds</th>'
);

// 5. UI Body
content = content.replace(
  /<td className="px-4 py-3 border-r border-\[#E2E8F0\] text-black font-bold">\{p\.categoryName\}<\/td>/g,
  '<td className="px-4 py-3 border-r border-[#E2E8F0] text-black font-bold">{p.categoryName}</td>\n                    <td className="px-4 py-3 border-r border-[#E2E8F0] text-right text-black font-bold">{p.currentBirds}</td>'
);

// 6. Colspan & Loader
content = content.replace(
  /<TableLoader columns=\{8\} \/>/g,
  '<TableLoader columns={9} />'
);
content = content.replace(
  /<td colSpan=\{8\} /g,
  '<td colSpan={9} '
);

fs.writeFileSync(file, content, 'utf8');
