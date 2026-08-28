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

  // Add imports if not exist
  if (!content.includes('AjuanSuratTugas')) {
    content = content.replace('import { FileText', "import type { AjuanSuratTugas } from '@/types';\nimport { FileText");
  }
  if (!content.includes('useSuratTugas')) {
    content = content.replace('import { useSearchParams', "import { useSuratTugas } from '@/hooks/useSuratTugas';\nimport { useSearchParams");
  }

  // Refactor Tabs
  const tabs = ['PegawaiPenugasanTab', 'LaporanPenugasanTab', 'PeriodePenugasanTab', 'PivotPenugasanTab', 'PenugasanBerlangsungTab', 'DraftPenugasanTab', 'BlokirPenugasanTab', 'RekapPenugasanTab'];
  
  for (const tab of tabs) {
    const rx1 = new RegExp('const ' + tab + ' = \\(\\)\\s*=>');
    content = content.replace(rx1, 'const ' + tab + ' = ({ tugasList }: { tugasList: AjuanSuratTugas[] }) =>');
  }

  // GenericTaskTable
  content = content.replace(
    'const GenericTaskTable = ({ tasks, emptyMsg, onRowClick }: { tasks: typeof dummyAjuanSuratTugas, emptyMsg: string, onRowClick?: (id: string) => void }) =>',
    'const GenericTaskTable = ({ tasks, emptyMsg, onRowClick }: { tasks: AjuanSuratTugas[], emptyMsg: string, onRowClick?: (id: string) => void }) =>'
  );
  
  content = content.replace(
    'const GenericTaskTable = ({ tasks, emptyMsg }: { tasks: typeof dummyAjuanSuratTugas, emptyMsg: string }) =>',
    'const GenericTaskTable = ({ tasks, emptyMsg }: { tasks: AjuanSuratTugas[], emptyMsg: string }) =>'
  );

  // Use tugasList
  content = content.replace(/dummyAjuanSuratTugas\.filter/g, 'tugasList.filter');
  content = content.replace(/dummyAjuanSuratTugas\.map/g, 'tugasList.map');
  content = content.replace(/dummyAjuanSuratTugas\.find/g, 'tugasList.find');
  content = content.replace(/typeof dummyAjuanSuratTugas\[0\]/g, 'AjuanSuratTugas');
  
  // in TugasPage component
  if (content.includes('const TugasPage = () => {') && !content.includes('const { tugasList } = useSuratTugas()')) {
    content = content.replace('const TugasPage = () => {', 'const TugasPage = () => {\n  const { tugasList } = useSuratTugas();');
  }
  if (content.includes('const SuratTugasPage = () => {') && !content.includes('const { tugasList } = useSuratTugas()')) {
    content = content.replace('const SuratTugasPage = () => {', 'const SuratTugasPage = () => {\n  const { tugasList } = useSuratTugas();');
  }

  // Replace tab calls
  for (const tab of tabs) {
    const rx = new RegExp('<' + tab + ' />', 'g');
    content = content.replace(rx, '<' + tab + ' tugasList={tugasList} />');
  }

  fs.writeFileSync(p, content);
  console.log('Fixed', p);
}
