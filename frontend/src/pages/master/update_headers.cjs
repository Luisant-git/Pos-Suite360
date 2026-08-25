const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'Units.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Regex to match the old header pattern
  // We need to find the specific block starting with the flex row
  const startRegex = /<div className="([^"]* flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0)">/g;
  let match = startRegex.exec(content);
  
  if (!match) continue;

  const bgClasses = match[1]; // The classes of the outer div
  const startIndex = match.index;
  
  // Find the closing div tag by counting open and close divs
  let openCount = 0;
  let endIndex = -1;
  let inString = false;
  let i = startIndex;
  
  while (i < content.length) {
    if (content.substr(i, 4) === '<div') openCount++;
    if (content.substr(i, 5) === '</div') openCount--;
    if (openCount === 0) {
      endIndex = i + 6;
      break;
    }
    i++;
  }

  if (endIndex === -1) continue;

  const oldBlock = content.substring(startIndex, endIndex);

  // Extract the title section
  const titleRegex = /<div className="flex items-center gap-2 text-\[#[\w\d]+\]">[\s\S]*?<\/div>/;
  const titleMatch = oldBlock.match(titleRegex);
  if (!titleMatch) continue;
  const titleBlock = titleMatch[0];

  // Extract the count section
  const countRegex = /<div className="bg-gray-500 text-white text-\[11px\] font-bold px-2 py-1 rounded-xl">[\s\S]*?<\/div>/;
  const countMatch = oldBlock.match(countRegex);
  if (!countMatch) continue;
  const countBlock = countMatch[0];

  // Extract the button section
  const buttonRegex = /<button type="button"[\s\S]*?className="([^"]*)"[\s\S]*?>[\s\S]*?<\/button>/;
  const buttonMatch = oldBlock.match(buttonRegex);
  if (!buttonMatch) continue;
  
  // modify the button to match new structure
  let newButton = buttonMatch[0].replace('gap-1 transition-colors', 'justify-center gap-1 transition-colors');
  newButton = newButton.replace('whitespace-nowrap', ''); // remove if exists
  newButton = newButton.replace('className="', 'className="whitespace-nowrap ');
  
  // Make button text responsive
  newButton = newButton.replace(/{isFullTable \? 'Show Form' : 'View Full Table'}/, `<span className="hidden sm:inline">{isFullTable ? 'Show Form' : 'View Full Table'}</span>\n                <span className="sm:hidden">{isFullTable ? 'Form' : 'Full Table'}</span>`);

  // Extract the search section (if exists)
  const searchRegex = /<div className="relative">[\s\S]*?<Search size={14} className="text-gray-400" \/>[\s\S]*?<\/div>\s*<\/div>/;
  const searchMatch = oldBlock.match(searchRegex);
  let searchBlock = '';
  if (searchMatch) {
    searchBlock = searchMatch[0].replace(/<\/div>\s*<\/div>$/, '</div>'); // remove the extra closing div if it matched
    
    // adjust search bar class
    searchBlock = searchBlock.replace('w-48', 'w-full md:w-48').replace('className="relative"', 'className="relative flex-1 md:flex-none"');
  } else {
    // try a more loose search regex if it didn't match the nested one
    const altSearchRegex = /<div className="relative">[\s\S]*?<input[\s\S]*?placeholder="Search[\s\S]*?<\/div>/;
    const altMatch = oldBlock.match(altSearchRegex);
    if (altMatch) {
      searchBlock = altMatch[0];
      searchBlock = searchBlock.replace('w-48', 'w-full md:w-48').replace('className="relative"', 'className="relative flex-1 md:flex-none"');
    }
  }

  // Combine to form new block
  const modifiedCountBlock = countBlock.replace('className="', 'className="md:hidden ');
  const desktopCountBlock = countBlock.replace('className="', 'className="hidden md:block ');

  const newBlock = `<div className="${bgClasses}">
          <div className="flex items-center justify-between w-full md:w-auto">
            ${titleBlock}
            ${modifiedCountBlock}
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            ${desktopCountBlock}
            <div className="flex flex-row items-center gap-2 w-full md:w-auto">
              ${searchBlock}
              ${newButton}
            </div>
          </div>
        </div>`;

  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Updated ' + file);
}

