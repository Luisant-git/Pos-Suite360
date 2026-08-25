const fs = require('fs');
const path = require('path');

const masterDir = 'frontend/src/pages/master';
const files = fs.readdirSync(masterDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(masterDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Extract the badge div
  const badgeRegex = /<div className="bg-gray-500 text-white text-\[11px\] font-bold px-2 py-0\.5 rounded-xl">\s*\{.*?\}.*?\n\s*<\/div>/s;
  const match = content.match(badgeRegex);

  if (match) {
    const badgeHtml = match[0];
    
    // Remove it from its current location
    content = content.replace(badgeRegex, '');

    // The title container looks like:
    // <div className="flex items-center gap-2 text-[#1F2937]">
    //   <Grid size={16} className="text-[#3B82F6]" />
    //   <h2 className="font-bold text-[14px]">CATEGORY LIST</h2>
    // </div>
    // We need to match this structure, keeping in mind color classes vary.
    
    const titleRegex = /<div className="flex items-center gap-2 text-\[[^\]]+\]">\s*<[^>]+>\s*<h2 className="font-bold text-\[14px\]">.*?<\/h2>\s*<\/div>/s;
    const titleMatch = content.match(titleRegex);

    if (titleMatch) {
      const originalTitleHtml = titleMatch[0];
      
      // We want to wrap originalTitleHtml and badgeHtml inside a new flex container
      // wait, we can just replace the outermost div class of the title to make it flex between.
      // e.g. <div className="flex items-center justify-between w-full md:w-auto text-[#1F2937]">
      //        <div className="flex items-center gap-2">
      //          <Grid .../> <h2...>...</h2>
      //        </div>
      //        <div className="badge...">...</div>
      //      </div>
      
      const colorMatch = originalTitleHtml.match(/text-\[[^\]]+\]/);
      const textColor = colorMatch ? colorMatch[0] : 'text-[#1F2937]';
      
      // Create inner title html by removing the outer div wrapper
      const innerTitleContent = originalTitleHtml
        .replace(/<div className="flex items-center gap-2 text-\[[^\]]+\]">/, '<div className="flex items-center gap-2">')
        
      const newTitleHtml = `<div className="flex items-center justify-between w-full md:w-auto ${textColor}">\n            ${innerTitleContent}\n            ${badgeHtml}\n          </div>`;
      
      content = content.replace(originalTitleHtml, newTitleHtml);
    }
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
