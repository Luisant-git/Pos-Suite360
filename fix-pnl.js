const fs = require('fs');

const file = 'frontend/src/pages/reports/ProfitLossReport.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Toolbar fixes
content = content.replace(
  '<div className="bg-white p-2 rounded shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-2 mb-2 shrink-0 print:hidden">',
  '<div className="bg-white p-2 md:p-3 rounded shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-2 shrink-0 print:hidden">'
);
content = content.replace(
  '<div className="flex items-center gap-4 flex-wrap">',
  '<div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 xl:gap-4 w-full lg:w-auto">'
);
content = content.replace(
  '<div className="flex items-center gap-2">\\n            <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">',
  '<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">\\n            <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1 w-full sm:w-auto mb-1 sm:mb-0">'
);
content = content.replace(
  '<div className="flex bg-gray-100 p-1 rounded border border-gray-200 gap-1 items-center">',
  '<div className="flex flex-wrap bg-gray-100 p-1 rounded border border-gray-200 gap-1 items-center w-full lg:w-auto">'
);
content = content.replace(
  '<div className="flex items-center gap-2">\\n          <button \\n            onClick={exportToCsv}',
  '<div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end mt-2 lg:mt-0">\\n          <button \\n            onClick={exportToCsv}'
);

// 2. POS SUITE 360 header fix
content = content.replace(
  '<div className="bg-[#1F2937] text-white px-4 py-2 flex justify-between items-center shrink-0">',
  '<div className="bg-[#1F2937] text-white px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 shrink-0">'
);

// 3. Footer net profit fix
content = content.replace(
  /<div className=\{\`\$\{isLoss \? 'bg-\[#EF4444\]' : 'bg-\[#10B981\]'\} text-white px-4 py-2 flex justify-between items-center shrink-0\`\}>/,
  '<div className={`${isLoss ? \\\'bg-[#EF4444]\\\' : \\\'bg-[#10B981]\\\'} text-white px-4 py-3 sm:py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 shrink-0`}>'
);
content = content.replace(
  '<h3 className="text-[18px] font-bold tracking-wider m-0 leading-tight">NET {isLoss ? \'LOSS\' : \'PROFIT\'} FOR PERIOD</h3>',
  '<h3 className="text-[15px] sm:text-[18px] font-bold tracking-wider m-0 leading-tight">NET {isLoss ? \'LOSS\' : \'PROFIT\'} FOR PERIOD</h3>'
);
content = content.replace(
  '<div className="flex flex-col items-end leading-tight">\\n              <span className="text-[22px] font-bold">{formatCurrency(safePnl.netProfit)}</span>',
  '<div className="flex flex-row sm:flex-col justify-between w-full sm:w-auto items-end leading-tight">\\n              <span className="text-[18px] sm:text-[22px] font-bold">{formatCurrency(safePnl.netProfit)}</span>'
);

fs.writeFileSync(file, content);
console.log('Fixed ProfitLossReport.tsx');
