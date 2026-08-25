const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remove responsive-table and min-w logic to allow horizontal scrolling
  content = content.replace(
    /<table className="([^"]+) responsive-table md:min-w-\[500px\]">/g,
    '<table className="$1 min-w-[500px]">'
  );

  // Fallback if the previous regex doesn't match
  content = content.replace(
    'responsive-table md:min-w-[500px]',
    'min-w-[500px]'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
