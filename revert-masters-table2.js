const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We want to remove 'responsive-table' completely from the table className.
  // And we want to ensure min-w-[700px] is added so it overflows correctly.
  
  content = content.replace(/<table className="([^"]+)"/g, (match, classes) => {
    let newClasses = classes.replace('responsive-table', '').trim();
    newClasses = newClasses.replace(/md:min-w-\[\d+px\]/g, '').trim();
    newClasses = newClasses.replace(/min-w-\[\d+px\]/g, '').trim();
    
    // Add the guaranteed min width
    newClasses = newClasses + " min-w-[800px]";
    
    // clean up multiple spaces
    newClasses = newClasses.replace(/\s+/g, ' ');
    
    return `<table className="${newClasses}"`;
  });

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
