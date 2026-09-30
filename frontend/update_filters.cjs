const fs = require('fs');
const path = require('path');
const dir = 'D:/Pos-Nasa Fresh Mart/frontend/src/pages/reports';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  content = content.replace(/<Search size=\{14\} \/>\s*Apply Filter/g, '<Search size={14} /> <span className=\"hidden sm:inline\">Apply Filter</span>');
  content = content.replace(/<RotateCcw size=\{14\} \/>\s*Reset Filters/g, '<RotateCcw size={14} /> <span className=\"hidden sm:inline\">Reset Filters</span>');
  content = content.replace(/<RefreshCw size=\{13\} \/>\s*Reset/g, '<RefreshCw size={13} /> <span className=\"hidden sm:inline\">Reset</span>');

  content = content.replace(/>\s*Today\s*<\/button>/g, '><Calendar size={14} /> <span className=\"hidden sm:inline\">Today</span></button>');
  content = content.replace(/>\s*This Month\s*<\/button>/g, '><Calendar size={14} /> <span className=\"hidden sm:inline\">This Month</span></button>');
  
  content = content.replace(/\{\s*isToday\s*&&\s*<CheckCircle2[^>]+>\s*\}\s*Today/g, '{isToday ? <CheckCircle2 size={14} className=\"text-blue-600\" /> : <Calendar size={14} />} <span className=\"hidden sm:inline\">Today</span>');
  content = content.replace(/\{\s*isMonth\s*&&\s*<CheckCircle2[^>]+>\s*\}\s*This Month/g, '{isMonth ? <CheckCircle2 size={14} className=\"text-blue-600\" /> : <Calendar size={14} />} <span className=\"hidden sm:inline\">This Month</span>');

  if (content !== original && content.includes('<Calendar') && !original.includes('Calendar')) {
      content = content.replace(/import \{([^}]+)\}\s+from\s+'lucide-react';/, (match, p1) => {
          return 'import { ' + p1 + ', Calendar } from \'lucide-react\';';
      });
  }

  content = content.replace(/className=\"(.*?)\">(<Search|<RotateCcw|<RefreshCw|<Calendar|\{isToday|\{isMonth)/g, (match, p1, p2) => {
      if (!p1.includes('shrink-0')) {
          return 'className=\"shrink-0 ' + p1 + '\">' + p2;
      }
      return match;
  });

  fs.writeFileSync(p, content, 'utf8');
}
console.log('Done Pos-Nasa');
