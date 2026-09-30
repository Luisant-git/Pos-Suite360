const fs = require('fs');
const file = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/PurchaseReport.tsx';
let content = fs.readFileSync(file, 'utf8');

// Excel map
content = content.replace(
  /'Payment Mode': p\.mode,/g,
  "'Payment Mode': p.mode,\n                  'No. of Birds': p.noOfBirds,"
);
content = content.replace(
  /'Payment Mode': '',/g,
  "'Payment Mode': '',\n                  'No. of Birds': '',"
);

// PDF data
content = content.replace(
  /mode: '',\n\s*totalAmount: '',/g,
  "mode: '',\n                  noOfBirds: '',\n                  totalAmount: '',"
);

fs.writeFileSync(file, content, 'utf8');
