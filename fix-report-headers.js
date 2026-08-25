const fs = require('fs');
const path = require('path');

const reportsDir = 'frontend/src/pages/reports';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(reportsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Header rows with right-side buttons usually have:
  // flex justify-between items-center
  // Let's find any that have px-4 py-3 (or similar) and 'justify-between items-center'
  
  // Actually, we can just replace 'flex justify-between items-center' 
  // with 'flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0'
  // but only inside bg-... border-b containers
  
  content = content.replace(
    /<div className="([^"]+) flex justify-between items-center"/g,
    (match, classes) => {
      // Don't replace if it's not a main section header
      if (classes.includes('border-b') && classes.includes('px-')) {
        return `<div className="${classes} flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0"`;
      }
      return match;
    }
  );

  // Also replace the right-side gap containers: '<div className="flex items-center gap-3">'
  // We'll replace it with '<div className="flex flex-wrap items-center gap-3 w-full md:w-auto">'
  // but only if it's the right-hand child of the header (just broadly matching it is usually safe in reports)
  
  content = content.replace(
    /<\/div>\s*<div className="flex items-center gap-3">/g,
    '</div>\n          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
