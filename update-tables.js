const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('frontend/src/pages', (file) => {
  if (!file.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Add whitespace-nowrap to tables
  content = content.replace(/<table className="([^"]+)"/g, (match, classes) => {
    if (!classes.includes('whitespace-nowrap')) {
      return `<table className="${classes} whitespace-nowrap"`;
    }
    return match;
  });

  // Make sure table container has overflow-x-auto
  content = content.replace(/className="([^"]*overflow-auto[^"]*)"/g, (match, classes) => {
     if(!classes.includes('overflow-x-auto')) {
        return `className="${classes} overflow-x-auto"`;
     }
     return match;
  });

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
