const fs = require('fs');

const fixTable = (file, labels) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add responsive-table to table class
  content = content.replace(/<table className="([^"]+)"/, (match, classes) => {
    if (!classes.includes('responsive-table')) {
      return `<table className="${classes.replace('min-w-[900px]', 'md:min-w-[900px]').replace('min-w-[1200px]', 'md:min-w-[1200px]')} responsive-table"`;
    }
    return match;
  });

  // Since React JSX can span multiple lines, let's just do a simple replacement for the td tags in the tbody.
  // Actually, we can split by '<tbody>' and '</tbody>'
  const tbodyStart = content.indexOf('<tbody>');
  const tbodyEnd = content.indexOf('</tbody>', tbodyStart);
  
  if (tbodyStart > -1 && tbodyEnd > -1) {
    let tbodyContent = content.substring(tbodyStart, tbodyEnd);
    
    // Find all <td ...> inside tbody
    let tdIndex = 0;
    tbodyContent = tbodyContent.replace(/<td([^>]*)>/g, (match, attrs) => {
      // Don't add data-label if it already exists
      if (attrs.includes('data-label')) return match;
      
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

fixTable('frontend/src/pages/sales/POS.tsx', ['#', 'Product', 'Stock', 'Unit', 'Qty', 'Rate', 'Disc %', 'Disc Amt', 'Total', 'Action']);
fixTable('frontend/src/pages/purchase/PurchaseEntry.tsx', ['#', 'Product', 'Stock', 'Unit', 'Qty', 'Free', 'Pur Rate', 'MRP', 'Tax %', 'Tax Amt', 'Disc %', 'Disc Amt', 'Total', 'Action']);
