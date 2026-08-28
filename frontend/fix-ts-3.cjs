const fs = require('fs');

// Fix admin/TugasPage.tsx
let admin = fs.readFileSync('src/pages/admin/TugasPage.tsx', 'utf8');
admin = admin.replace(/import \{ useSearchParams \} from 'react-router-dom';/g, '');
admin = admin.replace("import { useSuratTugas } from '@/hooks/useSuratTugas';", "import { useSuratTugas } from '@/hooks/useSuratTugas';\nimport { useSearchParams } from 'react-router-dom';");
fs.writeFileSync('src/pages/admin/TugasPage.tsx', admin);

// Fix user/TugasPage.tsx
let user = fs.readFileSync('src/pages/user/TugasPage.tsx', 'utf8');
user = user.replace('formData.tempat', 'formData.lokasiPenugasan');
user = user.replace(/=== 'SELESAI'/g, "=== 'SURAT_TERBIT'");
fs.writeFileSync('src/pages/user/TugasPage.tsx', user);
