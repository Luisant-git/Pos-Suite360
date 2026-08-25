const fs = require('fs');

const fixTable = (file, labels) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add responsive-table to table class
  content = content.replace(/<table className="([^"]+)"/, (match, classes) => {
    if (!classes.includes('responsive-table')) {
      return `<table className="${classes} responsive-table md:min-w-[800px]"`;
    }
    return match;
  });

  const tbodyStart = content.indexOf('<tbody>');
  const tbodyEnd = content.indexOf('</tbody>', tbodyStart);
  
  if (tbodyStart > -1 && tbodyEnd > -1) {
    let tbodyContent = content.substring(tbodyStart, tbodyEnd);
    
    // Find all <td ...> inside tbody
    let tdIndex = 0;
    tbodyContent = tbodyContent.replace(/<td([^>]*)>/g, (match, attrs) => {
      if (attrs.includes('data-label')) return match;
      if (attrs.includes('colSpan')) return match; // skip empty rows
      
      const label = labels[tdIndex % labels.length];
      tdIndex++;
      
      return `<td data-label="${label}"${attrs}>`;
    });
    
    content = content.substring(0, tbodyStart) + tbodyContent + content.substring(tbodyEnd);
  }

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
};

fixTable('frontend/src/pages/sales/SalesReturn.tsx', ['#', 'Product', 'Unit', 'Sold Qty', 'Sale Rate', 'Return Qty', 'Total Amount', 'Action']);
fixTable('frontend/src/pages/purchase/PurchaseReturn.tsx', ['#', 'Product', 'Unit', 'Pur Qty', 'Pur Rate', 'Return Qty', 'Total Amount', 'Action']);
