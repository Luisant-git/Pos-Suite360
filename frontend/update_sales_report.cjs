const fs = require('fs');
const file = 'd:/Pos-Nasa Fresh Mart/frontend/src/pages/reports/SalesReport.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Map data to include noOfBirds
content = content.replace(
  /noOfItems: s\.items\?\.length \|\| 0,/g,
  'noOfItems: s.items?.length || 0,\n          noOfBirds: s.items?.reduce((sum: number, item: any) => sum + (Number(item.noOfBirds) || 0), 0) || 0,'
);

// 2. Add column header to export to Excel
content = content.replace(
  /'No\. of Items': s\.noOfItems,/g,
  "'No. of Items': s.noOfItems,\n                  'No. of Birds': s.noOfBirds,"
);
content = content.replace(
  /'No\. of Items': '',\n\s*'Total Amount': formatCurrency\(totalSalesAmount\)/g,
  "'No. of Items': '',\n                  'No. of Birds': 'TOTAL AMOUNT:',\n                  'Total Amount': formatCurrency(totalSalesAmount)"
);
// In case the export header had TOTAL AMOUNT: in No. of Items instead of Total Amount (wait, the code had 'No. of Items': 'TOTAL AMOUNT:' before? Let's check.)
