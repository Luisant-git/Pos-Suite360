const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const fixGridClasses = (content) => {
  // We want to target className="... grid grid-cols-2 ..."
  // But be careful not to override existing md:grid-cols-2 or lg:grid-cols-2 if they exist
  
  return content.replace(/className="([^"]*?grid-cols-([23456])[^"]*?)"/g, (match, classes, colNum) => {
    // If it already has responsive prefixes like md:grid-cols or sm:grid-cols, we might want to be careful
    // But if it ONLY has grid-cols-X and NOT grid-cols-1, let's fix it.
    if (classes.includes('grid-cols-1') || classes.includes('sm:grid-cols-') || classes.includes('md:grid-cols-') || classes.includes('lg:grid-cols-') || classes.includes('xl:grid-cols-')) {
      // If it already has responsive variations, we skip to be safe, except if it's explicitly grid-cols-X without prefix
      // Actually, if it has `grid-cols-2 md:grid-cols-4`, changing it to `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` is better.
    }
    
    // Replace standalone grid-cols-X with grid-cols-1 md:grid-cols-X
    const newClasses = classes.replace(new RegExp(`(?<![:a-z-])grid-cols-${colNum}`, 'g'), `grid-cols-1 md:grid-cols-${colNum}`);
    return `className="${newClasses}"`;
  });
};

walkDir('frontend/src/pages', (file) => {
  if (!file.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = fixGridClasses(content);

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
