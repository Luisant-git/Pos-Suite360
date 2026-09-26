const fs = require('fs');

let path = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/master/Products.tsx';
let content = fs.readFileSync(path, 'utf8');

// Header
content = content.replace(
  /<th className="px-3 py-2 border-r border-\[#444\] text-center">Stock<\/th>/g,
  '<th className="px-3 py-2 border-r border-[#444] text-center">Birds</th>\n                <th className="px-3 py-2 border-r border-[#444] text-center">Stock</th>'
);

// Body
content = content.replace(
  /<td data-label="Stock" className="px-3 py-2\.5 border-r border-\[#E5E7EB\] text-center font-bold">/g,
  '<td data-label="Birds" className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold text-[#D97706]">{product.currentBirds || 0}</td>\n                    <td data-label="Stock" className="px-3 py-2.5 border-r border-[#E5E7EB] text-center font-bold">'
);

// Loader
content = content.replace(/columns=\{10\}/g, 'columns={11}');
content = content.replace(/colSpan=\{10\}/g, 'colSpan={11}');

fs.writeFileSync(path, content);
console.log('Products.tsx patched');
