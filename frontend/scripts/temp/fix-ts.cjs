const fs = require('fs');

const filePaths = [
  'src/pages/admin/TugasPage.tsx',
  'src/pages/user/TugasPage.tsx',
  'src/pages/approval/SuratTugasPage.tsx',
  'src/pages/super-admin/TugasPage.tsx'
];

for (const p of filePaths) {
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');

  // Fix imports
  if (!content.includes('import type { AjuanSuratTugas }')) {
    content = "import type { AjuanSuratTugas } from '@/types';\n" + content;
  }
  
  // Fix unused dummyAjuanSuratTugas
  content = content.replace(/dummyAjuanSuratTugas, /g, '');
  content = content.replace(/\{ dummyAjuanSuratTugas \}/g, '');
  content = content.replace(/dummyAjuanSuratTugas/g, 'tugasList');

  // Fix p implicitly has any type
  content = content.replace(/p => p\.id === pegawai\.id/g, '(p: any) => p.id === pegawai.id');
  content = content.replace(/t => t\.pegawaiDitugaskan/g, '(t: AjuanSuratTugas) => t.pegawaiDitugaskan');
  content = content.replace(/tugas =>/g, '(tugas: any) =>');
  content = content.replace(/\(peg, idx\)/g, '(peg: any, idx: number)');
  content = content.replace(/t =>/g, '(t: AjuanSuratTugas) =>');

  fs.writeFileSync(p, content);
}
