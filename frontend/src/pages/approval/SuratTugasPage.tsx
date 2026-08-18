import React, { useState, useMemo } from 'react';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, CheckCircle2, Eye, Download, 
  MapPin, Calendar as CalendarIcon, Users
} from 'lucide-react';

export const SuratTugasPage = () => {
  const { user } = useAuth();
  const currentDate = new Date();
  
  // Set default to current month and year
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const myUnitData = dummyAjuanSuratTugas.filter(t => t.unitKerja === user?.unitKerja);

  const displayData = useMemo(() => {
    return myUnitData.filter(t => {
      // Hanya tampilkan yang sudah terbit (selesai approval)
      if (t.status !== 'SURAT_TERBIT') return false;
      
      const dateObj = new Date(t.tanggalMulai);
      return dateObj.getMonth() === selectedMonth && dateObj.getFullYear() === selectedYear;
    });
  }, [myUnitData, selectedMonth, selectedYear]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Generate some years around current year
  const currentY = currentDate.getFullYear();
  const years = [currentY - 2, currentY - 1, currentY, currentY + 1];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Surat Tugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar surat tugas yang telah resmi diterbitkan.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="p-4">Informasi Surat</th>
                <th className="p-4">Pegawai Ditugaskan</th>
                <th className="p-4">Pelaksanaan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.length > 0 ? (
                displayData.map((tugas) => (
                  <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-800 text-sm">{tugas.nomorSurat}</span>
                        <span className="text-slate-600 text-xs line-clamp-2" title={tugas.perihal}>
                          {tugas.perihal}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                          <FileText className="w-3 h-3" />
                          <span>Oleh: {tugas.pengaju.nama} ({tugas.unitKerja})</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{tugas.pegawaiDitugaskan.length} Orang</span>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                          {tugas.pegawaiDitugaskan.slice(0, 3).map((peg, idx) => (
                            <img
                              key={idx}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 object-cover"
                              src={peg.fotoAvatar || `https://ui-avatars.com/api/?name=${peg.nama}&background=random`}
                              alt={peg.nama}
                              title={peg.nama}
                            />
                          ))}
                          {tugas.pegawaiDitugaskan.length > 3 && (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-medium text-slate-600">
                              +{tugas.pegawaiDitugaskan.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-2 text-xs text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {tugas.tanggalMulai} <br/>s/d {tugas.tanggalSelesai}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="line-clamp-2">{tugas.lokasiPenugasan}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Telah Diterbitkan
                      </span>
                    </td>
                    <td className="p-4 align-top text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Unduh File">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center flex-col flex items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                      Tidak ada surat tugas yang diterbitkan pada bulan ini.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
