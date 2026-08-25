const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We are looking for the right-side list header. It usually contains "flex justify-between items-center" 
  // right before the "CATEGORY LIST" or "UNIT LIST" title.
  // Actually, we can just replace 'px-4 py-3 flex justify-between items-center' with 'px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0'
  
  content = content.replace(
    /px-4 py-3 flex justify-between items-center/g,
    'px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0'
  );
  
  // also make sure search input wrapping is handled properly
  // For Units.tsx, it has a search input that can shrink.
  // We can add w-full to the search input container if we want, or just let it wrap.
  
  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
