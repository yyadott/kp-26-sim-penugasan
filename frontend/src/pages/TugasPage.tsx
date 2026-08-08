import { useState } from 'react';
import { dummyAjuanSuratTugas, dummyPegawaiList, UNIT_COLORS } from '@/data/dummyData';
import type { AjuanSuratTugas, UnitKerjaType } from '@/types';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  Eye,
  X,
  FileCheck,
  Send,
  MoreHorizontal,
  Users,
  Hourglass,
} from 'lucide-react';

export const TugasPage = () => {
  const [ajuanList, setAjuanList] = useState<AjuanSuratTugas[]>(dummyAjuanSuratTugas);
  const [activeTab, setActiveTab] = useState<'DAFTAR' | 'WORKFLOW'>('DAFTAR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<UnitKerjaType[]>([]);
  const [isUnitFilterOpen, setIsUnitFilterOpen] = useState(false);

  // Modal Detail Workflow / Timeline
  const [selectedAjuan, setSelectedAjuan] = useState<AjuanSuratTugas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawaiAjuan, setSelectedPegawaiAjuan] = useState<AjuanSuratTugas | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modal Form Ajuan Baru
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    perihal: '',
    unitKerja: 'RBI' as UnitKerjaType,
    pegawaiId: dummyPegawaiList[0].id,
    tanggalMulai: '2026-08-01',
    tanggalSelesai: '2026-08-03',
    lokasiPenugasan: 'Kecamatan Bandung Tengah',
    koordinatLat: -6.9147,
    koordinatLng: 107.6098,
    deskripsi: '',
  });

  // Filter list
  const filteredAjuan = ajuanList.filter((item) => {
    const matchesSearch =
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasiPenugasan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = selectedUnits.length === 0 || selectedUnits.includes(item.unitKerja);
    return matchesSearch && matchesUnit;
  });

  const unitOptions: UnitKerjaType[] = ['RBI', 'Fastingkom', 'Kepeg', 'PM'];

  const toggleUnitFilter = (unit: UnitKerjaType) => {
    setSelectedUnits((currentUnits) => currentUnits.includes(unit)
      ? currentUnits.filter((currentUnit) => currentUnit !== unit)
      : [...currentUnits, unit]);
  };

  const formatLokasiKhusus = (lokasi: string) => {
    const cleaned = lokasi.trim();
    if (!cleaned) return '';
    let result = cleaned.replace(/,?\s*jawa barat$/i, '').trim();
    result = result.replace(/^kecamatan\s+/i, '').trim();
    result = result.replace(/^desa\s+/i, '').trim();
    result = result.replace(/^kelurahan\s+/i, '').trim();
    result = result.replace(/^kota\s+/i, 'Kota ').trim();
    result = result.replace(/^kabupaten\s+/i, 'Kabupaten ').trim();
    return `${result}, Jawa Barat`;
  };

  const formatTanggal = (tanggal: string) => {
    const [tahun, bulan, hari] = tanggal.split('-');
    return `${hari}/${bulan}/${tahun}`;
  };

  const formatRentangTanggal = (tanggalMulai: string, tanggalSelesai: string) => {
    const mulai = formatTanggal(tanggalMulai);
    return tanggalMulai === tanggalSelesai ? mulai : `${mulai} s/d ${formatTanggal(tanggalSelesai)}`;
  };

  const updateStatusAjuan = (id: string, status: AjuanSuratTugas['status']) => {
    setAjuanList((currentList) => currentList.map((item) => (
      item.id === id ? { ...item, status } : item
    )));
    setSelectedAjuan((current) => current?.id === id ? { ...current, status } : current);
    setOpenStatusId(null);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedPegawai = dummyPegawaiList.find((p) => p.id === formData.pegawaiId) || dummyPegawaiList[0];
    const newId = `st-00${ajuanList.length + 1}`;
    const newNomor = `DRAFT-ST/${formData.unitKerja.toUpperCase().replace(/\s+/g, '')}/2026/00${ajuanList.length + 1}`;

    const newAjuan: AjuanSuratTugas = {
      id: newId,
      nomorSurat: newNomor,
      perihal: formData.perihal,
      pengaju: dummyPegawaiList[0], // Logged in user
      pegawaiDitugaskan: [assignedPegawai],
      unitKerja: formData.unitKerja,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      lokasiPenugasan: formData.lokasiPenugasan,
      koordinat: [formData.koordinatLat, formData.koordinatLng],
      deskripsi: formData.deskripsi,
      status: 'DRAFT',
      workflow: [
        {
          stage: 'DRAFT',
          label: 'Pengajuan Draft ST',
          actor: dummyPegawaiList[0].nama,
          tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'COMPLETED',
          catatan: 'Draft baru telah diajukan ke sistem.',
        },
        {
          stage: 'VERIFIKASI_SUBBAGIAN',
          label: 'Verifikasi Subbagian Umum',
          actor: `Kasubag ${formData.unitKerja}`,
          status: 'IN_PROGRESS',
          catatan: 'Menunggu review dokumen persyaratan.',
        },
        { stage: 'PERSETUJUAN_PIMPINAN', label: 'Persetujuan Pimpinan', actor: 'Kepala Dinas', status: 'PENDING' },
        { stage: 'SURAT_TERBIT', label: 'Penerbitan Surat Tugas Resmi', actor: 'Tata Usaha', status: 'PENDING' },
      ],
    };

    setAjuanList([newAjuan, ...ajuanList]);
    setIsFormModalOpen(false);
    setFormData({
      perihal: '',
      unitKerja: 'RBI',
      pegawaiId: dummyPegawaiList[0].id,
      tanggalMulai: '2026-08-01',
      tanggalSelesai: '2026-08-03',
      lokasiPenugasan: 'Kecamatan Bandung Tengah',
      koordinatLat: -6.9147,
      koordinatLng: 107.6098,
      deskripsi: '',
    });
  };

  const getStatusBadge = (status: AjuanSuratTugas['status']) => {
    const statusIsApproved = status === 'SURAT_TERBIT';
    const statusIsRejected = status === 'DITOLAK';
    const label = statusIsApproved ? 'Diapprove' : statusIsRejected ? 'Dibatalkan' : 'Diproses';
    const classes = statusIsApproved
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      : statusIsRejected
        ? 'bg-rose-100 text-rose-800 border border-rose-300'
        : 'bg-slate-100 text-slate-700 border border-slate-300';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${classes}`}>
        {statusIsApproved ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : statusIsRejected ? (
          <X className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <Hourglass className="w-3.5 h-3.5" />
        )}
        {label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Penugasan Pegawai</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Kelola proses ajuan surat tugas, alur persetujuan draft penugasan, dan pelacakan status penugasan instansi.
          </p>
        </div>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Draft Ajuan ST</span>
        </button>
      </div>

      {/* Navigation Tabs & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-menu Tabs */}
        <div className="flex items-center bg-slate-200/70 p-1.5 rounded-xl text-sm font-medium w-fit">
          <button
            onClick={() => setActiveTab('DAFTAR')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'DAFTAR' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Daftar Proses Ajuan ST ({ajuanList.length})
          </button>
        </div>
        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari perihal, nomor surat, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-xs"
            />
            </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUnitFilterOpen((isOpen) => !isOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50 sm:text-sm"
              aria-expanded={isUnitFilterOpen}
            >
              <Filter className="h-4 w-4 text-slate-400" />
              <span>
                {selectedUnits.length === 0
                  ? 'Semua Unit Kerja'
                  : selectedUnits.length === 1
                    ? selectedUnits[0]
                    : `${selectedUnits.length} unit dipilih`}
              </span>
            </button>

            {isUnitFilterOpen && (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                onMouseLeave={() => setIsUnitFilterOpen(false)}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                  <span className="text-xs font-bold text-slate-700">Filter Unit Kerja</span>
                  {selectedUnits.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedUnits([])}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1 pt-2">
                  {unitOptions.map((unit) => (
                    <label key={unit} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unit)}
                        onChange={() => toggleUnitFilter(unit)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                      />
                      <span>{unit}</span>
                    </label>
                  ))}
                </div>
                <p className="border-t border-slate-100 px-2 pt-2 text-[11px] text-slate-400">
                  Kosongkan pilihan untuk menampilkan semua unit.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* TAB 1: DAFTAR PROSES AJUAN SURAT TUGAS */}
      {activeTab === 'DAFTAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nomor & Perihal Surat</th>
                  <th className="px-6 py-4">Unit Kerja & Pengaju</th>
                  <th className="px-6 py-4">Pegawai Ditugaskan</th>
                  <th className="px-6 py-4">Tanggal & Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAjuan.map((item) => {
                  const unitColor = UNIT_COLORS[item.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 min-w-[430px]">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block w-fit mb-1">
                          {item.nomorSurat}
                        </span>
                        <p className="font-semibold text-slate-800 whitespace-nowrap">{item.perihal}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${unitColor.bg} ${unitColor.text} mb-1`}>
                          {item.unitKerja}
                        </span>
                        <p className="text-xs font-medium text-slate-600">Oleh: {item.pengaju.nama}</p>
                        <p className="text-[11px] text-slate-500">NIP: {item.pengaju.nip}</p>
                      </td>
                      <td className="px-6 py-4 min-w-[170px] align-top">
                        {item.pegawaiDitugaskan.length === 1 ? (
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                            {item.pegawaiDitugaskan[0].nama}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedPegawaiAjuan(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                            aria-label={`Lihat ${item.pegawaiDitugaskan.length} pegawai yang ditugaskan`}
                          >
                            <Users className="h-3.5 w-3.5" />
                            {item.pegawaiDitugaskan.length} Pegawai
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {formatRentangTanggal(item.tanggalMulai, item.tanggalSelesai)}
                        </p>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{formatLokasiKhusus(item.lokasiPenugasan)}</span>
                        </div>
                      </td>
                      <td
                        className="relative px-6 py-4"
                        onMouseLeave={() => setOpenStatusId((current) => current === item.id ? null : current)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenStatusId(openStatusId === item.id ? null : item.id);
                            setOpenActionId(null);
                          }}
                          className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                          aria-label={`Ubah status ajuan ${item.nomorSurat}`}
                          aria-expanded={openStatusId === item.id}
                        >
                          {getStatusBadge(item.status)}
                        </button>
                        {openStatusId === item.id && (
                          <div className="absolute left-6 top-14 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                            <button type="button" onClick={() => updateStatusAjuan(item.id, 'SURAT_TERBIT')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle2 className="w-4 h-4" /> Diapprove
                            </button>
                            <button type="button" onClick={() => updateStatusAjuan(item.id, 'VERIFIKASI_SUBBAGIAN')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100">
                              <Hourglass className="w-4 h-4" /> Diproses
                            </button>
                            <button type="button" onClick={() => updateStatusAjuan(item.id, 'DITOLAK')} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50">
                              <X className="w-4 h-4" /> Dibatalkan
                            </button>
                          </div>
                        )}
                      </td>
                      <td
                        className="relative px-6 py-4 text-right"
                        onMouseLeave={() => setOpenActionId((current) => current === item.id ? null : current)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionId(openActionId === item.id ? null : item.id);
                            setOpenStatusId(null);
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                          aria-label={`Aksi ajuan ${item.nomorSurat}`}
                          aria-expanded={openActionId === item.id}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openActionId === item.id && (
                          <div className="absolute right-6 top-14 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAjuan(item);
                                setIsModalOpen(true);
                                setOpenActionId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Alur Draft
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALUR DRAFT & APPROVAL WORKFLOW */}
      {activeTab === 'WORKFLOW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Ajuan Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Pilih Ajuan Surat Tugas
            </h3>
            <p className="text-xs text-slate-500">Klik ajuan di bawah untuk meninjau alur draft & persetujuan secara mendalam.</p>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredAjuan.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAjuan(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${selectedAjuan?.id === item.id
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-blue-700">{item.nomorSurat}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">{item.perihal}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{item.unitKerja} • {item.lokasiPenugasan}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Stepper View */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            {selectedAjuan ? (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {selectedAjuan.nomorSurat}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedAjuan.perihal}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pengaju: <span className="font-semibold text-slate-700">{selectedAjuan.pengaju.nama}</span> ({selectedAjuan.unitKerja})
                    </p>
                  </div>
                  <div>{getStatusBadge(selectedAjuan.status)}</div>
                </div>

                {/* Vertical Stepper Timeline */}
                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-4">Tahapan Alur Persetujuan Draft ST:</h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedAjuan.workflow.map((step, idx) => {
                      const isDone = step.status === 'COMPLETED';
                      const isInProgress = step.status === 'IN_PROGRESS';

                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          {/* Dot Badge */}
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white text-xs ${isDone
                              ? 'border-emerald-500 text-emerald-600'
                              : isInProgress
                                ? 'border-blue-500 text-blue-600 animate-pulse'
                                : 'border-slate-300 text-slate-400'
                              }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                            ) : isInProgress ? (
                              <Clock className="w-4 h-4 text-blue-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                            )}
                          </div>

                          {/* Content Card */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-sm text-slate-800">{step.label}</h5>
                              {step.tanggal && <span className="text-[11px] text-slate-400 font-mono">{step.tanggal}</span>}
                            </div>
                            <p className="text-xs text-slate-600">
                              Pelaksana: <span className="font-semibold text-slate-800">{step.actor}</span>
                            </p>
                            {step.catatan && (
                              <p className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 mt-2 italic">
                                &quot;{step.catatan}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
            </div>
            ) : (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-sm font-medium">Pilih surat tugas di sebelah kiri untuk melihat alur persetujuan lengkap.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MODAL DAFTAR PEGAWAI YANG DITUGASKAN */}
      {selectedPegawaiAjuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <Users className="h-5 w-5 text-blue-600" />
                  Daftar Pegawai Ditugaskan
                </h3>
                <p className="mt-1 text-xs text-slate-500">{selectedPegawaiAjuan.nomorSurat}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPegawaiAjuan(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup daftar pegawai"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {selectedPegawaiAjuan.pegawaiDitugaskan.map((pegawai, index) => (
                <div key={pegawai.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0 space-y-1 text-sm">
                      <p className="font-bold text-slate-800">{pegawai.nama}</p>
                      <p className="text-xs text-slate-600">NIP: {pegawai.nip}</p>
                      <p className="text-xs font-semibold text-blue-700">Unit Kerja: {pegawai.unitKerja}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setSelectedPegawaiAjuan(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL ALUR WORKFLOW */}
      {isModalOpen && selectedAjuan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Alur Draft & Track Record Persetujuan
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
                {getStatusBadge(selectedAjuan.status)}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{selectedAjuan.perihal}</h4>
              <p className="text-xs text-slate-600">{selectedAjuan.deskripsi}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Riwayat Tahapan Persetujuan:</h4>
              <div className="space-y-3">
                {selectedAjuan.workflow.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    {w.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : w.status === 'IN_PROGRESS' ? (
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
                    )}
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{w.label}</span>
                        <span className="text-slate-400 font-normal">{w.tanggal || 'Menunggu'}</span>
                      </div>
                      <p className="text-xs text-slate-600">Aktor: {w.actor}</p>
                      {w.catatan && <p className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">{w.catatan}</p>}
                    </div>
                  </div>
                ))}
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

      {/* MODAL FORM BUAT DRAFT AJUAN BARU */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Form Pengajuan Draft Surat Tugas
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perihal Penugasan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pendampingan Monitoring Posko Kesehatan..."
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Kerja Pengaju</label>
                  <select
                    value={formData.unitKerja}
                    onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value as UnitKerjaType })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="RBI">RBI</option>
                    <option value="Fastingkom">Fastingkom</option>
                    <option value="Kepeg">Kepeg</option>
                    <option value="PM">PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pegawai Ditugaskan</label>
                  <select
                    value={formData.pegawaiId}
                    onChange={(e) => setFormData({ ...formData, pegawaiId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {dummyPegawaiList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.unitKerja})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Penugasan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung Balai Kota Bandung"
                  value={formData.lokasiPenugasan}
                  onChange={(e) => setFormData({ ...formData, lokasiPenugasan: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Tugas</label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan rinci mengenai agenda dan uraian tugas..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Ajuan Draft</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
