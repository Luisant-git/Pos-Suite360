const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix header layout
  content = content.replace(
    '<div className="bg-[#f9f9f9] border-b border-[#E6E9ED] px-4 py-3 flex justify-between items-center">',
    '<div className="bg-[#f9f9f9] border-b border-[#E6E9ED] px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">'
  );

  // Fix right side button container wrapping
  content = content.replace(
    /<\/div>\s*<div className="flex items-center gap-3">/g,
    '</div>\n          <div className="flex flex-wrap items-center gap-3">'
  );

  // Fix table class
  content = content.replace(
    '<table className="w-full text-left text-[13px] whitespace-nowrap">',
    '<table className="w-full text-left text-[13px] whitespace-nowrap responsive-table md:min-w-[500px]">'
  );

  // Find headers and add data-label
  const theadStart = content.indexOf('<thead>');
  const theadEnd = content.indexOf('</thead>');
  if (theadStart > -1 && theadEnd > -1) {
    const theadContent = content.substring(theadStart, theadEnd);
    const headers = [];
    const thRegex = /<th[^>]*>(.*?)<\/th>/g;
    let match;
    while ((match = thRegex.exec(theadContent)) !== null) {
      // Strip html tags from header if any
      const rawText = match[1].replace(/<[^>]*>?/gm, '').trim();
      headers.push(rawText);
    }

    const tbodyStart = content.indexOf('<tbody>');
    const tbodyEnd = content.indexOf('</tbody>', tbodyStart);
    if (tbodyStart > -1 && tbodyEnd > -1) {
      let tbodyContent = content.substring(tbodyStart, tbodyEnd);
      
      let tdIndex = 0;
      tbodyContent = tbodyContent.replace(/<td([^>]*)>/g, (m, attrs) => {
        if (attrs.includes('colSpan') || attrs.includes('data-label')) {
          if (attrs.includes('colSpan')) tdIndex = 0; // reset on full row
          return m;
        }
        
        const label = headers[tdIndex % headers.length];
        tdIndex++;
        return `<td data-label="${label}"${attrs}>`;
      });
      
      content = content.substring(0, tbodyStart) + tbodyContent + content.substring(tbodyEnd);
    }
  }

  // Also fix the main scroll container
  content = content.replace(
    '<div className="flex-1 overflow-auto p-4 overflow-x-auto">',
    '<div className="flex-1 overflow-y-auto custom-scrollbar p-4 overflow-x-auto">'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
