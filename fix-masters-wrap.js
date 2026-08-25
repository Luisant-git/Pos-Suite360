const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We are looking for the right-side gap container.
  content = content.replace(
    /<\/div>\s*<div className="flex items-center gap-3">/g,
    '</div>\n          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">'
  );

  // For those already replaced as flex-wrap items-center gap-3
  content = content.replace(
    /<\/div>\s*<div className="flex flex-wrap items-center gap-3">/g,
    '</div>\n          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
