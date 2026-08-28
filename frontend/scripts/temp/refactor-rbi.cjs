const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      replaceInDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      let changed = false;

      // Fix array mappings
      const arrRe = /\['RBI', 'Fastingkom', 'Kepeg', 'PM'\]/g;
      if (arrRe.test(content)) {
         content = content.replace(arrRe, "['Kepeg', 'Fastingkom', 'PM']");
         changed = true;
      }
      
      // Fix specific types and default values
      if (content.includes("'RBI' | 'Fastingkom' | 'Kepeg' | 'PM'")) {
         content = content.replace(/'RBI' \| 'Fastingkom' \| 'Kepeg' \| 'PM'/g, "'Kepeg' | 'Fastingkom' | 'PM'");
         changed = true;
      }

      // Remove RBI type from union
      if (content.includes("| 'RBI'")) {
         content = content.replace(/\| 'RBI'/g, "");
         changed = true;
      }
      
      if (content.includes("  | 'RBI'")) {
         content = content.replace(/\n\s*\| 'RBI'/g, "");
         changed = true;
      }

      if (content.includes("unitKerja: 'RBI'")) {
         content = content.replace(/unitKerja: 'RBI'/g, "unitKerja: 'Kepeg'");
         changed = true;
      }

      if (content.includes("<option value=\"RBI\">RBI</option>")) {
         content = content.replace(/<option value="RBI">RBI<\/option>/g, "");
         changed = true;
      }

      if (content.includes("<option>RBI</option>")) {
         content = content.replace(/<option>RBI<\/option>/g, "");
         changed = true;
      }
      
      if (content.includes("|| 'RBI'")) {
         content = content.replace(/\|\| 'RBI'/g, "|| 'Kepeg'");
         changed = true;
      }

      if (changed) {
        fs.writeFileSync(p, content);
      }
    }
  }
}
replaceInDir('src');
