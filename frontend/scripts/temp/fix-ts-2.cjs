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

  // Fix property names
  content = content.replace(/\.perihal/g, '.uraianKegiatan');
  content = content.replace(/\.lokasiPenugasan/g, '.tempat');

  // Fix implicit any
  content = content.replace(/t => t\.pegawaiDitugaskan/g, '(t: any) => t.pegawaiDitugaskan');
  content = content.replace(/p => p\.id ===/g, '(p: any) => p.id ===');
  content = content.replace(/t => <li/g, '(t: any) => <li');
  content = content.replace(/t => t\.unitKerja/g, '(t: any) => t.unitKerja');
  content = content.replace(/t => t\.status/g, '(t: any) => t.status');
  content = content.replace(/t => new Date/g, '(t: any) => new Date');
  content = content.replace(/t => \['DRAFT'/g, '(t: any) => [\'DRAFT\'');
  content = content.replace(/t => t\.id/g, '(t: any) => t.id');

  // Specific for EmailTemplateParams error in user/TugasPage.tsx
  // "Object literal may only specify known properties, and 'perihal' does not exist in type 'EmailTemplateParams'."
  content = content.replace(/perihal:/g, 'uraianKegiatan:');

  fs.writeFileSync(p, content);
}
