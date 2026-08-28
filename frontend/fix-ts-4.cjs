const fs = require('fs');

// Fix admin/TugasPage.tsx unused variables
let admin = fs.readFileSync('src/pages/admin/TugasPage.tsx', 'utf8');
admin = admin.replace(', getUnitColor', '');
admin = admin.replace(/const unitOptions = .+\n/, '');
fs.writeFileSync('src/pages/admin/TugasPage.tsx', admin);

// Fix user/TugasPage.tsx type overlap
let user = fs.readFileSync('src/pages/user/TugasPage.tsx', 'utf8');
user = user.replace(/=== 'SURAT_TERBIT'/g, "=== ('SURAT_TERBIT' as any)");
fs.writeFileSync('src/pages/user/TugasPage.tsx', user);
