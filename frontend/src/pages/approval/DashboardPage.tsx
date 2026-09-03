import { useState } from 'react';
import { formatDate } from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { CalendarWidget } from '@/components/ui/CalendarWidget';
import { UNIT_COLORS } from '@/data/dummyData';
import type { AjuanSuratTugas } from '@/types';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Clock,
  Building,
  X,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { tugasList } = useSuratTugas();
  const todayFormatted = formatDate(new Date().toISOString());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAjuan, setSelectedAjuan] = useState<AjuanSuratTugas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableFilter, setTableFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const myUnitData = tugasList.filter((t: any) => t.unitKerja === user?.unitKerja);

  const recentAjuan = myUnitData.filter((item) => {
    if (tableFilter === 'APPROVED' && item.status !== 'SURAT_TERBIT') return false;
    if (tableFilter === 'PENDING' && item.status !== 'VERIFIKASI_SUBBAGIAN' && item.status !== 'PERSETUJUAN_PIMPINAN') return false;
    if (!selectedDate) return true;
    const itemDate = new Date(item.tanggalMulai);
    return itemDate.toDateString() === selectedDate.toDateString();
  }).slice(0, 8);
  const approvedLettersCount = myUnitData.filter(item => item.status === 'SURAT_TERBIT').length;
  const pendingLettersCount = myUnitData.filter(item => item.status === 'VERIFIKASI_SUBBAGIAN' || item.status === 'PERSETUJUAN_PIMPINAN').length;

  const formatLokasiDisplay = (lokasi?: string) => {
    if (!lokasi) return '';
    const cleaned = lokasi.trim();
    if (!cleaned) return '';
    if (cleaned.toLowerCase().includes('jawa barat')) return cleaned;
    if (
      cleaned.toLowerCase().includes('kota ') ||
      cleaned.toLowerCase().includes('kabupaten ') ||
      cleaned.toLowerCase().includes('kecamatan ')
    ) {
      return `${cleaned}, Jawa Barat`;
    }
    return cleaned;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
            <Building className="w-3.5 h-3.5" />
            <span>{user?.unitKerja} • {user?.role}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, <span className="text-blue-400">{user?.nama}</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Sistem Informasi Manajemen Penugasan, Presensi Pegawai, & Visualisasi Pemetaan Lokasi Terpadu.
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right font-mono text-xs sm:text-sm">
          <span className="text-slate-400 block text-[11px] font-sans">Hari ini:</span>
          <span className="font-bold text-white text-base">{todayFormatted}</span>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute right-40 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
      </div>

      {/* Executive Stats Cards & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => setTableFilter(prev => prev === 'APPROVED' ? 'ALL' : 'APPROVED')}
            className={`text-left p-5 rounded-2xl border shadow-xs transition-all flex flex-col focus:outline-none min-h-[200px] ${
              tableFilter === 'APPROVED' 
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400 ring-offset-2' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Disetujui</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${tableFilter === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
              <span className="text-5xl font-black text-slate-800">{approvedLettersCount}</span>
              <span className="text-xs text-slate-500 block mt-2 text-center">Surat Tugas yang telah diterbitkan</span>
            </div>
          </button>

          <button
            onClick={() => setTableFilter(prev => prev === 'PENDING' ? 'ALL' : 'PENDING')}
            className={`text-left p-5 rounded-2xl border shadow-xs transition-all flex flex-col focus:outline-none min-h-[200px] ${
              tableFilter === 'PENDING' 
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 ring-offset-2' 
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Butuh Approval</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${tableFilter === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-600'}`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
              <span className="text-5xl font-black text-amber-800">{pendingLettersCount}</span>
              <span className="text-xs text-slate-500 block mt-2 text-center">Ajuan menunggu persetujuan Anda</span>
            </div>
          </button>
        </div>

        <div className="lg:col-span-1">
          <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>

      {/* Table Layout */}
      <div className="w-full">
        {/* Ajuan Surat Tugas Terbaru */}
        <div className="w-full bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              {tableFilter === 'APPROVED' ? 'Surat Tugas Disetujui' : tableFilter === 'PENDING' ? 'Surat Tugas Butuh Approval' : 'Proses Ajuan Surat Tugas Terbaru'}
            </h3>
            <Link to="/tugas" className="text-sm font-semibold text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4 font-medium">No. Surat / Uraian Kegiatan</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Unit & Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAjuan.map((item) => {
                  const unitColor = UNIT_COLORS[item.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };
                  const statusIsApproved = item.status === 'SURAT_TERBIT';
                  const statusIsRejected = item.status === 'DITOLAK';
                  const statusLabel = statusIsApproved ? 'Disetujui' : statusIsRejected ? 'Ditolak' : 'Diproses';
                  const statusBadgeClass = statusIsApproved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    : statusIsRejected
                      ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                      : 'bg-amber-50 text-amber-700 border-amber-200/60';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => {
                        setSelectedAjuan(item);
                        setIsModalOpen(true);
                      }}
                      className="group hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs font-bold text-blue-700 mb-1">{item.nomorSurat}</div>
                        <div className="font-medium text-slate-800 line-clamp-1">{item.uraianKegiatan}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadgeClass}`}>
                          {statusIsApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : statusIsRejected ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${unitColor.bg} ${unitColor.text}`}>
                            {item.unitKerja}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{formatLokasiDisplay(item.tempat)}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedAjuan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Detail Ajuan Surat Tugas
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700">{selectedAjuan.nomorSurat}</span>
                <span className="text-xs text-slate-500">{selectedAjuan.unitKerja}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{selectedAjuan.uraianKegiatan}</h4>
              <p className="text-xs text-slate-600">{selectedAjuan.deskripsi}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Tanggal Penugasan</div>
                <div className="text-sm font-semibold text-slate-800">{selectedAjuan.tanggalMulai} s/d {selectedAjuan.tanggalSelesai}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Lokasi</div>
                <div className="text-sm font-semibold text-slate-800">{formatLokasiDisplay(selectedAjuan.tempat)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-3">Pegawai Ditugaskan</div>
                <div className="space-y-2">
                  {selectedAjuan.pegawaiDitugaskan.map((p) => (
                    <div key={p.id} className="rounded-xl bg-white border border-slate-200 p-3 text-sm font-medium text-slate-800">
                      {p.nama} • {p.jabatan}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-3">Riwayat Workflow</div>
                <div className="space-y-3">
                  {selectedAjuan.workflow.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                      {w.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
                      )}
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{w.label}</span>
                          <span className="text-slate-400 font-normal">{w.tanggal || 'Menunggu'}</span>
                        </div>
                        <p className="text-xs text-slate-600">Aktor: {w.actor}</p>
                        {w.catatan && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">{w.catatan}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
