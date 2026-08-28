import { useState } from 'react';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { Eye, Edit3, CheckCircle2, XCircle, X, FileText, Clock, CheckCheck, Search } from 'lucide-react';
import type { AjuanSuratTugas } from '@/types';

type TabKey = 'baru' | 'proses' | 'selesai';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Diajukan', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  VERIFIKASI_SUBBAGIAN: { label: 'Verifikasi Subbagian', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  PERSETUJUAN_PIMPINAN: { label: 'Persetujuan Pimpinan', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  SURAT_TERBIT: { label: 'Surat Terbit', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200' },
};

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'baru', label: 'Ajuan Baru', icon: <FileText className="w-4 h-4" /> },
  { key: 'proses', label: 'Sedang Diproses', icon: <Clock className="w-4 h-4" /> },
  { key: 'selesai', label: 'Selesai Diproses', icon: <CheckCheck className="w-4 h-4" /> },
];

export const AjuanPegawaiPage = () => {
  const [ajuanList, setAjuanList] = useState<AjuanSuratTugas[]>([...dummyAjuanSuratTugas]);
  const [activeTab, setActiveTab] = useState<TabKey>('baru');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [detailModal, setDetailModal] = useState<AjuanSuratTugas | null>(null);
  const [editModal, setEditModal] = useState<AjuanSuratTugas | null>(null);
  const [editForm, setEditForm] = useState({ uraianKegiatan: '', deskripsi: '' });

  // Filter ajuan by tab
  const filterByTab = (tab: TabKey): AjuanSuratTugas[] => {
    let filtered: AjuanSuratTugas[];
    switch (tab) {
      case 'baru':
        filtered = ajuanList.filter(a => a.status === 'DRAFT');
        break;
      case 'proses':
        filtered = ajuanList.filter(a => a.status === 'VERIFIKASI_SUBBAGIAN' || a.status === 'PERSETUJUAN_PIMPINAN');
        break;
      case 'selesai':
        filtered = ajuanList.filter(a => a.status === 'SURAT_TERBIT' || a.status === 'DITOLAK');
        break;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.pengaju.nama.toLowerCase().includes(q) ||
        a.pengaju.nip.toLowerCase().includes(q) ||
        (a.uraianKegiatan || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  // Handlers
  const handleApprove = (id: string) => {
    setAjuanList(prev => prev.map(a => {
      if (a.id !== id) return a;
      const nextStatusMap: Record<string, AjuanSuratTugas['status']> = {
        DRAFT: 'VERIFIKASI_SUBBAGIAN',
        VERIFIKASI_SUBBAGIAN: 'PERSETUJUAN_PIMPINAN',
        PERSETUJUAN_PIMPINAN: 'SURAT_TERBIT',
      };
      const nextStatus = nextStatusMap[a.status];
      if (!nextStatus) return a;
      return { ...a, status: nextStatus };
    }));
  };

  const handleReject = (id: string) => {
    setAjuanList(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'DITOLAK' as const } : a
    ));
  };

  const openEdit = (ajuan: AjuanSuratTugas) => {
    setEditForm({ uraianKegiatan: ajuan.uraianKegiatan, deskripsi: ajuan.deskripsi });
    setEditModal(ajuan);
  };

  const handleEditSave = () => {
    if (!editModal) return;
    setAjuanList(prev => prev.map(a =>
      a.id === editModal.id ? { ...a, uraianKegiatan: editForm.uraianKegiatan, deskripsi: editForm.deskripsi } : a
    ));
    setEditModal(null);
  };

  const currentData = filterByTab(activeTab);

  const tabCounts = {
    baru: ajuanList.filter(a => a.status === 'DRAFT').length,
    proses: ajuanList.filter(a => a.status === 'VERIFIKASI_SUBBAGIAN' || a.status === 'PERSETUJUAN_PIMPINAN').length,
    selesai: ajuanList.filter(a => a.status === 'SURAT_TERBIT' || a.status === 'DITOLAK').length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ajuan Pegawai</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola seluruh ajuan surat tugas pegawai berdasarkan status pengajuan.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari NIP, nama pegawai, atau perihal ajuan..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">NIP</th>
                <th className="px-5 py-3.5 font-semibold">Nama Pegawai</th>
                <th className="px-5 py-3.5 font-semibold">Nama Ajuan</th>
                <th className="px-5 py-3.5 font-semibold">Tanggal Ajuan</th>
                <th className="px-5 py-3.5 font-semibold">Status Ajuan</th>
                <th className="px-5 py-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada data ajuan pada kategori ini.
                  </td>
                </tr>
              ) : (
                currentData.map(ajuan => {
                  const statusInfo = STATUS_LABEL[ajuan.status] || { label: ajuan.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={ajuan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[13px] text-slate-600">{ajuan.pengaju.nip}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{ajuan.pengaju.nama}</td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{ajuan.uraianKegiatan}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{ajuan.tanggalMulai}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDetailModal(ajuan)}
                            title="Lihat Detail"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {ajuan.status !== 'SURAT_TERBIT' && ajuan.status !== 'DITOLAK' && (
                            <>
                              <button
                                onClick={() => openEdit(ajuan)}
                                title="Edit Ajuan"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApprove(ajuan.id)}
                                title="Approve"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(ajuan.id)}
                                title="Tolak / Batal"
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Detail Ajuan */}
      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-800">Detail Ajuan</h3>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Profil Pengaju */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={detailModal.pengaju.fotoAvatar || `${import.meta.env.BASE_URL}pp-navbar-2.jpg`}
                  alt={detailModal.pengaju.nama}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-blue-200 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{detailModal.pengaju.nama}</h4>
                  <p className="text-xs text-slate-500 font-mono">NIP. {detailModal.pengaju.nip}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <span>{detailModal.pengaju.unitKerja}</span>
                    <span className="text-slate-300">•</span>
                    <span>{detailModal.pengaju.jabatan}</span>
                  </div>
                </div>
              </div>

              {/* Info Ajuan */}
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Uraian Kegiatan / Nama Ajuan</p>
                  <p className="text-sm text-slate-800 font-medium">{detailModal.uraianKegiatan}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Keterangan</p>
                  <p className="text-sm text-slate-700">{detailModal.deskripsi}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor Surat</p>
                    <p className="text-sm text-slate-800 font-mono">{detailModal.nomorSurat}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Saat Ini</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${STATUS_LABEL[detailModal.status]?.color || 'bg-slate-100'}`}>
                      {STATUS_LABEL[detailModal.status]?.label || detailModal.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal Mulai</p>
                    <p className="text-sm text-slate-800">{detailModal.tanggalMulai}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tanggal Selesai</p>
                    <p className="text-sm text-slate-800">{detailModal.tanggalSelesai}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tempat</p>
                    <p className="text-sm text-slate-800">{detailModal.tempat} — {detailModal.lokasiSpesifik}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Timeline */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Status Workflow</p>
                <div className="space-y-0">
                  {detailModal.workflow.map((step, i) => {
                    const isCompleted = step.status === 'COMPLETED';
                    const isActive = step.status === 'IN_PROGRESS';
                    const isRejected = step.status === 'REJECTED';
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 mt-1 ${
                            isCompleted ? 'bg-emerald-500 border-emerald-500' :
                            isActive ? 'bg-blue-500 border-blue-500 animate-pulse' :
                            isRejected ? 'bg-red-500 border-red-500' :
                            'bg-white border-slate-300'
                          }`} />
                          {i < detailModal.workflow.length - 1 && (
                            <div className={`w-0.5 h-8 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-700' : isActive ? 'text-blue-700' : isRejected ? 'text-red-700' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-500">{step.actor}{step.tanggal ? ` — ${step.tanggal}` : ''}</p>
                          {step.catatan && <p className="text-xs text-slate-600 mt-0.5 italic">{step.catatan}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Ajuan */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Edit Ajuan</h3>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Uraian Kegiatan / Nama Ajuan</label>
                <input
                  type="text"
                  value={editForm.uraianKegiatan}
                  onChange={e => setEditForm({ ...editForm, uraianKegiatan: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={4}
                  value={editForm.deskripsi}
                  onChange={e => setEditForm({ ...editForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
              <button
                onClick={handleEditSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
