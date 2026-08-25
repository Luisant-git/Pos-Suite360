const fs = require('fs');
const path = require('path');

const reportsDir = 'frontend/src/pages/reports';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(reportsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix filter buttons container
  content = content.replace(
    '<div className="flex justify-between items-center pt-2 border-t border-dashed border-[#E2E8F0]">',
    '<div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2 border-t border-dashed border-[#E2E8F0] gap-3 md:gap-0">'
  );

  // Fix filter buttons wrap inside the container
  content = content.replace(
    '<div className="flex items-center gap-3">\n            <button type="button" onClick={() => refetch()}',
    '<div className="flex flex-wrap items-center gap-3 w-full md:w-auto">\n            <button type="button" onClick={() => refetch()}'
  );
  
  content = content.replace(
    '<div className="flex items-center gap-2">\n            <button type="button" onClick={() => {\n              const today',
    '<div className="flex flex-wrap items-center gap-2 w-full md:w-auto">\n            <button type="button" onClick={() => {\n              const today'
  );

  // Fix bottom bar
  content = content.replace(
    '<div className="bg-[#020617] text-white px-6 py-3 flex justify-between items-center shrink-0 print:hidden">',
    '<div className="bg-[#020617] text-white px-4 md:px-6 py-3 flex flex-col-reverse md:flex-row justify-between items-center md:items-end gap-3 md:gap-0 shrink-0 print:hidden w-full">'
  );
  
  // Also adjust the text size of the total amount so it doesn't break out of the container
  content = content.replace(
    /className="text-\[28px\] font-black text-\[#38BDF8\] leading-none"/g,
    'className="text-[20px] md:text-[28px] font-black text-[#38BDF8] leading-none break-all"'
  );

  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
