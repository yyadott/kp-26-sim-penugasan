import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyAjuanSuratTugas, dummyPegawaiList } from '@/data/dummyData';
import { FileText, Calendar, Activity, ChevronDown } from 'lucide-react';
import { format, differenceInDays, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { id } from 'date-fns/locale';

// Utility for formatting date
const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 ring-slate-600/10',
    VERIFIKASI_SUBBAGIAN: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    PERSETUJUAN_PIMPINAN: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    SURAT_TERBIT: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    DITOLAK: 'bg-red-50 text-red-700 ring-red-600/10',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.DRAFT}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// 1. Pegawai Penugasan (Tabel Pegawai dan Tugas Aktifnya)
const PegawaiPenugasanTab = () => {
  const activeTasks = dummyAjuanSuratTugas.filter(t => t.status === 'SURAT_TERBIT' || t.status === 'PERSETUJUAN_PIMPINAN');
  const pegawaiWithTasks = dummyPegawaiList.map(pegawai => {
    const tasks = activeTasks.filter(t => t.pegawaiDitugaskan.some(p => p.id === pegawai.id));
    return { ...pegawai, activeTasks: tasks };
  }).filter(p => p.activeTasks.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Pegawai</th>
            <th className="px-6 py-4 font-semibold">Unit Kerja</th>
            <th className="px-6 py-4 font-semibold">Tugas Aktif</th>
            <th className="px-6 py-4 font-semibold">Jumlah Tugas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pegawaiWithTasks.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={p.fotoAvatar} alt={p.nama} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <p className="font-semibold text-slate-800">{p.nama}</p>
                    <p className="text-xs text-slate-500">NIP. {p.nip}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium">{p.unitKerja}</span></td>
              <td className="px-6 py-4">
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {p.activeTasks.map(t => <li key={t.id} className="truncate max-w-xs" title={t.perihal}>{t.nomorSurat}</li>)}
                </ul>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-700">{p.activeTasks.length} Tugas</td>
            </tr>
          ))}
          {pegawaiWithTasks.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Tidak ada pegawai yang sedang bertugas.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

// Tooltip component untuk daftar pegawai (Tampilan Awan)
const PegawaiTooltip = ({ pegawaiList }: { pegawaiList: typeof dummyPegawaiList }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!pegawaiList || pegawaiList.length === 0) return <span className="text-slate-400">-</span>;
  
  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="font-medium text-slate-700">{pegawaiList[0].nama}</span>
        {pegawaiList.length > 1 && (
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            +{pegawaiList.length - 1}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 w-max max-w-xs bg-white border border-slate-200 shadow-xl rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
          <div className="relative z-10">
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider border-b border-slate-100 pb-1">Pegawai Ditugaskan</h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {pegawaiList.map(p => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <img src={p.fotoAvatar} alt={p.nama} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                  <span className="font-medium">{p.nama}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Generic Table Component for tasks
const GenericTaskTable = ({ tasks, emptyMsg }: { tasks: typeof dummyAjuanSuratTugas, emptyMsg: string }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
        <tr>
          <th className="px-6 py-4 font-semibold">Nomor Surat</th>
          <th className="px-6 py-4 font-semibold">Perihal</th>
          <th className="px-6 py-4 font-semibold">Tanggal Mulai</th>
          <th className="px-6 py-4 font-semibold">Tanggal Berakhir</th>
          <th className="px-6 py-4 font-semibold">Pegawai Ditugaskan</th>
          <th className="px-6 py-4 font-semibold">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {tasks.map(t => (
          <tr key={t.id} className="hover:bg-slate-50 transition">
            <td className="px-6 py-4 font-medium text-slate-800">{t.nomorSurat}</td>
            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={t.perihal}>{t.perihal}</td>
            <td className="px-6 py-4 text-slate-600">{formatDate(t.tanggalMulai)}</td>
            <td className="px-6 py-4 text-slate-600">{formatDate(t.tanggalSelesai)}</td>
            <td className="px-6 py-4"><PegawaiTooltip pegawaiList={t.pegawaiDitugaskan} /></td>
            <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
          </tr>
        ))}
        {tasks.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">{emptyMsg}</td></tr>}
      </tbody>
    </table>
  </div>
);

// 2. Laporan Penugasan (SURAT_TERBIT)
const LaporanPenugasanTab = () => {
  const [expandedPegawaiId, setExpandedPegawaiId] = useState<string | null>(null);

  const pegawaiWithTasks = dummyPegawaiList.map(pegawai => {
    // Collect all tasks for this employee
    const tasks = dummyAjuanSuratTugas.filter(t => t.pegawaiDitugaskan.some(p => p.id === pegawai.id));
    return { ...pegawai, allTasks: tasks };
  }).filter(p => p.allTasks.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Pegawai</th>
            <th className="px-6 py-4 font-semibold">Unit Kerja</th>
            <th className="px-6 py-4 font-semibold text-center">Total Penugasan</th>
            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pegawaiWithTasks.map(p => (
            <React.Fragment key={p.id}>
              <tr 
                className={`hover:bg-slate-50 transition cursor-pointer ${expandedPegawaiId === p.id ? 'bg-blue-50/50' : ''}`}
                onClick={() => setExpandedPegawaiId(expandedPegawaiId === p.id ? null : p.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.fotoAvatar} alt={p.nama} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <p className="font-semibold text-slate-800">{p.nama}</p>
                      <p className="text-xs text-slate-500">NIP. {p.nip}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium">{p.unitKerja}</span>
                </td>
                <td className="px-6 py-4 text-center font-semibold text-slate-700">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs">{p.allTasks.length} Penugasan</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                      {expandedPegawaiId === p.id ? 'Tutup Detail' : 'Lihat Detail'}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedPegawaiId === p.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedPegawaiId === p.id && (
                <tr className="bg-slate-50 border-b border-slate-200">
                  <td colSpan={4} className="p-0">
                    <div className="p-6">
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 bg-white flex justify-between items-center">
                          <h4 className="font-bold text-slate-700">Rincian Penugasan: {p.nama}</h4>
                        </div>
                        <GenericTaskTable tasks={p.allTasks} emptyMsg="Belum ada penugasan." />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {pegawaiWithTasks.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada data laporan penugasan pegawai.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// 3. Periode Penugasan (Timeline/Date view)
const PeriodePenugasanTab = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentDate.getFullYear()));

  const filteredTasks = dummyAjuanSuratTugas.filter(t => {
    const taskDate = new Date(t.tanggalMulai);
    const matchMonth = selectedMonth === 'ALL' || String(taskDate.getMonth() + 1) === selectedMonth;
    const matchYear = selectedYear === 'ALL' || String(taskDate.getFullYear()) === selectedYear;
    return matchMonth && matchYear;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(b.tanggalMulai).getTime() - new Date(a.tanggalMulai).getTime());

  const months = [
    { value: 'ALL', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const availableYears = Array.from(new Set(dummyAjuanSuratTugas.map(t => new Date(t.tanggalMulai).getFullYear()))).sort().reverse();
  const years = ['ALL', ...availableYears.map(String)];
  if (!availableYears.includes(currentDate.getFullYear()) && !years.includes(String(currentDate.getFullYear()))) {
     years.splice(1, 0, String(currentDate.getFullYear()));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800">Filter Periode Penugasan</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            {years.map(y => <option key={y} value={y}>{y === 'ALL' ? 'Semua Tahun' : y}</option>)}
          </select>
        </div>
      </div>
      <GenericTaskTable tasks={sortedTasks} emptyMsg="Tidak ada data penugasan pada periode ini." />
    </div>
  );
};

// 4. Pivot Penugasan
const PivotPenugasanTab = () => {
  const units = Array.from(new Set(dummyAjuanSuratTugas.map(t => t.unitKerja)));
  const statuses = ['DRAFT', 'VERIFIKASI_SUBBAGIAN', 'PERSETUJUAN_PIMPINAN', 'SURAT_TERBIT', 'DITOLAK'];
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-sm border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold text-left border-r border-slate-200">Unit Kerja</th>
            {statuses.map(s => <th key={s} className="px-4 py-4 font-semibold border-r border-slate-200">{s.replace(/_/g, ' ')}</th>)}
            <th className="px-6 py-4 font-bold bg-blue-50 text-blue-800">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {units.map(unit => {
            const unitTasks = dummyAjuanSuratTugas.filter(t => t.unitKerja === unit);
            return (
              <tr key={unit} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-left border-r border-slate-200">{unit}</td>
                {statuses.map(status => (
                  <td key={status} className="px-4 py-4 border-r border-slate-200 text-slate-600">
                    {unitTasks.filter(t => t.status === status).length || '-'}
                  </td>
                ))}
                <td className="px-6 py-4 font-bold bg-blue-50/50 text-blue-800">{unitTasks.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// 5. Penugasan Berlangsung
const PenugasanBerlangsungTab = () => {
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  const filteredTasks = dummyAjuanSuratTugas.filter(t => {
    if (t.status !== 'SURAT_TERBIT') return false;
    
    // Check if the current date is within the start and end dates
    const taskStart = new Date(t.tanggalMulai);
    // Adjust end date to the end of the day
    const taskEnd = new Date(t.tanggalSelesai);
    taskEnd.setHours(23, 59, 59, 999);
    
    const now = new Date();
    // Berlangsung means current date is between start and end (or equal)
    const isOngoing = now >= taskStart && now <= taskEnd;
    
    // Fallback logic if we just want to filter by start date for the dropdown categories
    if (filter === 'TODAY') return isToday(taskStart);
    if (filter === 'WEEK') return isThisWeek(taskStart);
    if (filter === 'MONTH') return isThisMonth(taskStart);
    
    return true; // For 'ALL' it just returns all 'SURAT_TERBIT' which are ongoing/terbit
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800">Filter Penugasan Berlangsung</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
        >
          <option value="ALL">Semua</option>
          <option value="TODAY">Hari Ini</option>
          <option value="WEEK">Minggu Ini</option>
          <option value="MONTH">Bulan Ini</option>
        </select>
      </div>
      <GenericTaskTable tasks={filteredTasks} emptyMsg="Tidak ada penugasan berlangsung pada kategori ini." />
    </div>
  );
};

// 6. Draft Penugasan
const DraftPenugasanTab = () => <GenericTaskTable tasks={dummyAjuanSuratTugas.filter(t => t.status === 'DRAFT')} emptyMsg="Tidak ada draft penugasan." />;

// 6. Blokir Penugasan (Ditolak)
const BlokirPenugasanTab = () => <GenericTaskTable tasks={dummyAjuanSuratTugas.filter(t => t.status === 'DITOLAK')} emptyMsg="Tidak ada penugasan yang diblokir atau ditolak." />;

// Removed JPPenugasanTab

// 8. Rekap Penugasan (Dashboard)
const RekapPenugasanTab = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentDate.getFullYear()));

  const filteredTasks = dummyAjuanSuratTugas.filter(t => {
    const taskDate = new Date(t.tanggalMulai);
    const matchMonth = selectedMonth === 'ALL' || String(taskDate.getMonth() + 1) === selectedMonth;
    const matchYear = selectedYear === 'ALL' || String(taskDate.getFullYear()) === selectedYear;
    return matchMonth && matchYear;
  });

  const counts = {
    total: filteredTasks.length,
    selesai: filteredTasks.filter(t => t.status === 'SURAT_TERBIT').length,
    proses: filteredTasks.filter(t => t.status === 'VERIFIKASI_SUBBAGIAN' || t.status === 'PERSETUJUAN_PIMPINAN').length,
    draft: filteredTasks.filter(t => t.status === 'DRAFT').length
  };

  const months = [
    { value: 'ALL', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const availableYears = Array.from(new Set(dummyAjuanSuratTugas.map(t => new Date(t.tanggalMulai).getFullYear()))).sort().reverse();
  const years = ['ALL', ...availableYears.map(String)];
  
  if (!availableYears.includes(currentDate.getFullYear()) && !years.includes(String(currentDate.getFullYear()))) {
     years.splice(1, 0, String(currentDate.getFullYear()));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800">Filter Periode Rekapitulasi</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            {years.map(y => <option key={y} value={y}>{y === 'ALL' ? 'Semua Tahun' : y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Penugasan', value: counts.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Selesai / Terbit', value: counts.selesai, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Dalam Proses', value: counts.proses, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Draft', value: counts.draft, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Daftar Penugasan</h3>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{filteredTasks.length} Data</span>
        </div>
        <GenericTaskTable tasks={filteredTasks} emptyMsg="Tidak ada data penugasan pada periode ini." />
      </div>
    </div>
  );
};


const TABS = [
  { id: 'rekap', label: 'Rekap Penugasan' },
  { id: 'pegawai', label: 'Pegawai Penugasan' },
  { id: 'laporan', label: 'Laporan Penugasan' },
  { id: 'periode', label: 'Periode Penugasan' },
  { id: 'pivot', label: 'Pivot Penugasan' },
  { id: 'berlangsung', label: 'Penugasan Berlangsung' },
  { id: 'draft', label: 'Draft Penugasan' },
  { id: 'blokir', label: 'Blokir Penugasan' },
];

import { useSearchParams } from 'react-router-dom';

export const TugasPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'rekap';

  const renderContent = () => {
    switch (activeTab) {
      case 'rekap': return <RekapPenugasanTab />;
      case 'pegawai': return <PegawaiPenugasanTab />;
      case 'laporan': return <LaporanPenugasanTab />;
      case 'periode': return <PeriodePenugasanTab />;
      case 'pivot': return <PivotPenugasanTab />;
      case 'berlangsung': return <PenugasanBerlangsungTab />;
      case 'draft': return <DraftPenugasanTab />;
      case 'blokir': return <BlokirPenugasanTab />;
      default: return null;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Penugasan</h1>
        <button
          onClick={() => navigate('/admin/tugas/buat')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
        >
          Buat Tugas Baru
        </button>
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
        {renderContent()}
      </div>
    </div>
  );
};
