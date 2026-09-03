import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dummyPegawaiList, getUnitColor } from '@/data/dummyData';
import type { AjuanSuratTugas, UnitKerjaType } from '@/types';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  FileCheck,
  Send,
  Users,
  Hourglass,
  Download,
  UploadCloud,
} from 'lucide-react';

import { sendEmailNotification } from '@/utils/emailService';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { useAuth } from '@/hooks/useAuth';

export const TugasPage = () => {
  const { user } = useAuth();
  type Wilayah = { id: string; name: string };
  const { tugasList, refreshTugas, addTugas } = useSuratTugas();
  const [activeTab] = useState<'DAFTAR' | 'WORKFLOW'>('DAFTAR');
  const [selectedUnits] = useState<UnitKerjaType[]>([]);
  const [selectedStatuses] = useState<string[]>([]);
  const [selectedApplicants] = useState<string[]>([]);
  const [selectedAssignees] = useState<string[]>([]);
  const [selectedLocations] = useState<string[]>([]);
  const [selectedSpecificLocations] = useState<string[]>([]);
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [filterTahun, setFilterTahun] = useState<string>('');
  const [previewAjuan, setPreviewAjuan] = useState<AjuanSuratTugas | null>(null);

  // Modal Detail Workflow / Timeline
  const [selectedAjuan, setSelectedAjuan] = useState<AjuanSuratTugas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawaiAjuan, setSelectedPegawaiAjuan] = useState<AjuanSuratTugas | null>(null);
  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [isWilayahLoading, setIsWilayahLoading] = useState(false);

  // Modal Form Ajuan Baru
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    uraianKegiatan: '',
    unitKerja: 'Kepeg' as UnitKerjaType,
    pegawaiIds: [dummyPegawaiList[0].id],
    tanggalMulai: '2026-08-01',
    tanggalSelesai: '2026-08-03',
    lokasiPenugasan: 'Kecamatan Bandung Tengah',
    lokasiSpesifik: '',
    provinsiId: '',
    kotaId: '',
    koordinatLat: -6.9147,
    koordinatLng: 107.6098,
    deskripsi: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: Wilayah[]) => setProvinces(data))
      .catch(() => setProvinces([]));

    // Fetch data from backend using hook
    refreshTugas();
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!formData.provinsiId) { setTimeout(() => setCities([]), 0); return; }
    setIsWilayahLoading(true);
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.provinsiId}.json`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: Wilayah[]) => setCities(data))
      .catch(() => setCities([]))
      .finally(() => setIsWilayahLoading(false));
  }, [formData.provinsiId]);

  useEffect(() => {
    if (formData.kotaId && cities.length > 0) {
      const kotaName = cities.find(c => c.id === formData.kotaId)?.name;
      if (kotaName) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${kotaName}, Indonesia`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setFormData(prev => ({
                ...prev,
                koordinatLat: parseFloat(data[0].lat),
                koordinatLng: parseFloat(data[0].lon)
              }));
            }
          })
          .catch(err => console.error("Geocoding failed", err));
      }
    }
  }, [formData.kotaId, cities]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Filter list
  const filteredAjuan = tugasList.filter((item) => {
    // Only show tasks where the logged in user is the pengaju or one of the assignees
    const isRelatedToUser =
      String(item.pengaju?.id) === String(user?.id) ||
      item.pegawaiDitugaskan.some((p: any) => String(p.id) === String(user?.id));

    if (!isRelatedToUser) return false;

    const matchesUnit = selectedUnits.length === 0 || selectedUnits.includes(item.unitKerja);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesApplicant = selectedApplicants.length === 0 || selectedApplicants.includes(item.pengaju.nama);
    const matchesAssignee = selectedAssignees.length === 0 || item.pegawaiDitugaskan.some((pegawai) => selectedAssignees.includes(pegawai.nama));
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(item.tempat);
    const matchesSpecificLocation = selectedSpecificLocations.length === 0 || selectedSpecificLocations.includes(item.lokasiSpesifik || '');

    const itemDate = new Date(item.tanggalMulai);
    const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
    const itemYear = itemDate.getFullYear().toString();

    const matchesBulan = filterBulan === '' || filterBulan === itemMonth;
    const matchesTahun = filterTahun === '' || filterTahun === itemYear;

    return matchesUnit && matchesStatus && matchesApplicant && matchesAssignee && matchesLocation && matchesSpecificLocation && matchesBulan && matchesTahun;
  });



  const formatLokasiKhusus = (lokasi?: string) => {
    if (!lokasi) return '';
    const cleaned = lokasi.trim();
    if (!cleaned) return '';
    let result = cleaned.replace(/,?\s*jawa barat$/i, '').trim();
    result = result.replace(/^kecamatan\s+/i, '').trim();
    result = result.replace(/^desa\s+/i, '').trim();
    result = result.replace(/^kelurahan\s+/i, '').trim();
    result = result.replace(/^kota\s+/i, 'Kota ').trim();
    result = result.replace(/^kabupaten\s+/i, 'Kabupaten ').trim();
    // Do not append province name here; it will be auto-filled when creating tugas.
    return result;
  };

  const formatTanggal = (tanggal: string) => {
    try {
      const date = new Date(tanggal);
      if (isNaN(date.getTime())) return tanggal;
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    } catch {
      return tanggal;
    }
  };

  const formatRentangTanggal = (tanggalMulai: string, tanggalSelesai: string) => {
    const mulai = formatTanggal(tanggalMulai);
    return tanggalMulai === tanggalSelesai ? mulai : `${mulai} s/d ${formatTanggal(tanggalSelesai)}`;
  };



  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedPegawai = dummyPegawaiList.filter((p) => formData.pegawaiIds.includes(p.id));
    if (assignedPegawai.length === 0) assignedPegawai.push(dummyPegawaiList[0]);

    const provinsi = provinces.find((item) => item.id === formData.provinsiId)?.name;
    const kota = cities.find((item) => item.id === formData.kotaId)?.name;
    const newNomor = `DRAFT-ST/${formData.unitKerja.toUpperCase().replace(/\s+/g, '')}/2026/00${tugasList.length + 1}`;
    const lokasiPenugasan = [kota, provinsi].filter(Boolean).join(', ') || formData.lokasiPenugasan;

    try {
      await addTugas({
        nomorSurat: newNomor,
        uraianKegiatan: formData.uraianKegiatan,
        pengaju_id: Number(user?.id) || 1,
        unitKerja: formData.unitKerja,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        tempat: formData.lokasiSpesifik ? `${formData.lokasiSpesifik}, ${lokasiPenugasan}` : lokasiPenugasan,
        koordinatLat: formData.koordinatLat,
        koordinatLng: formData.koordinatLng,
        deskripsi: formData.deskripsi,
        status: 'DRAFT',
        pegawaiDitugaskan: formData.pegawaiIds.map(id => Number(id) || 1)
      });
    } catch (err) {
      console.error('Gagal menyimpan ke database', err);
    }

    // Kirim notifikasi email
    try {
      for (const pegawai of assignedPegawai) {
        await sendEmailNotification({
          to_email: pegawai.email || 'user@example.com',
          to_name: pegawai.nama,
          nomor_surat: newNomor,
          uraianKegiatan: formData.uraianKegiatan,
          tanggal_mulai: formData.tanggalMulai,
          tanggal_selesai: formData.tanggalSelesai,
          lokasi: lokasiPenugasan,
          pesan_tambahan: formData.deskripsi
        });
      }
    } catch (err) {
      console.error('Failed to send email notifications', err);
    }

    setIsFormModalOpen(false);
    setFormData({
      uraianKegiatan: '',
      unitKerja: 'Kepeg',
      pegawaiIds: [dummyPegawaiList[0].id],
      tanggalMulai: '2026-08-01',
      tanggalSelesai: '2026-08-03',
      lokasiPenugasan: 'Kecamatan Bandung Tengah',
      lokasiSpesifik: '',
      provinsiId: '',
      kotaId: '',
      koordinatLat: -6.9147,
      koordinatLng: 107.6098,
      deskripsi: '',
      file: null,
    });
  };

  const getStatusBadge = (status: AjuanSuratTugas['status']) => {
    const statusIsApproved = status === ('SURAT_TERBIT' as any);
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
      {/* Navigation and Table */}
      <div className="flex flex-col gap-6">
        <main className="min-w-0 w-full">

          {/* TAB 1: DAFTAR PROSES AJUAN SURAT TUGAS */}
          {activeTab === 'DAFTAR' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-lg text-slate-800">Daftar Surat Tugas Anda</h3>
                <div className="flex items-center gap-3">
                  <select
                    value={filterBulan}
                    onChange={(e) => setFilterBulan(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 shadow-sm"
                  >
                    <option value="">Semua Bulan</option>
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                  <select
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 shadow-sm"
                  >
                    <option value="">Semua Tahun</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Nomor & Perihal Surat</th>
                        <th className="px-6 py-4">Unit Kerja & Pengaju</th>
                        <th className="px-6 py-4">Pegawai Ditugaskan</th>
                        <th className="px-6 py-4">Tanggal Mulai</th>
                        <th className="px-6 py-4">Tanggal Selesai</th>
                        <th className="px-6 py-4">Lokasi</th>
                        <th className="px-6 py-4 text-right">Unduh Surat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAjuan.map((item) => {
                        const unitColor = getUnitColor(item.unitKerja);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 min-w-[430px]">
                              <span
                                onClick={() => setPreviewAjuan(item)}
                                className="cursor-pointer hover:bg-blue-100 font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block w-fit mb-1 transition-colors"
                                title="Klik untuk melihat dokumen surat"
                              >
                                {item.nomorSurat}
                              </span>
                              <p
                                onClick={() => setPreviewAjuan(item)}
                                className="cursor-pointer hover:text-blue-600 font-semibold text-slate-800 leading-relaxed transition-colors"
                                title="Klik untuk melihat dokumen surat"
                              >
                                {item.uraianKegiatan}
                              </p>
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
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                                    {item.pegawaiDitugaskan[0].nama}
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">NIP: {item.pegawaiDitugaskan[0].nip || '-'}</p>
                                </div>
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
                                {formatTanggal(item.tanggalMulai)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-semibold text-slate-800">
                                {formatTanggal(item.tanggalSelesai)}
                              </p>
                            </td>
                            <td className="px-6 py-4 min-w-[200px] align-top">
                              <div className="flex items-start gap-1.5 text-slate-700 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold">{formatLokasiKhusus(item.tempat)}</p>
                                  {item.lokasiSpesifik && <p className="text-slate-500 mt-0.5">{item.lokasiSpesifik}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 flex flex-col gap-2 min-w-[130px]">
                              <a
                                href={`http://localhost:3001/api/download-surat/${item.id}`}
                                download
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Unduh
                              </a>
                              {(item.status === ('SURAT_TERBIT' as any) || item.status === ('SURAT_TERBIT' as any)) && (
                                <Link
                                  to="/pegawai/tugas/laporan"
                                  state={{ selectedTaskId: item.id }}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/20"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  Laporan
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                      <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">{item.uraianKegiatan}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{item.unitKerja} • {item.tempat}</p>
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
                        <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedAjuan.uraianKegiatan}</h3>
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

          {/* MODAL PREVIEW SURAT TUGAS A4 */}
          {previewAjuan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-4xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Preview Dokumen Surat Tugas
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPreviewAjuan(null)}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center rounded-xl border border-slate-300">
                  {/* A4 Paper Mockup */}
                  <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-lg text-black font-serif text-sm relative shrink-0">
                    {/* Kop Surat */}
                    <div className="border-b-[3px] border-black pb-4 mb-8 text-center flex flex-col items-center">
                      <h1 className="font-bold text-xl uppercase tracking-wide">Pemerintah Provinsi Jawa Barat</h1>
                      <h2 className="font-bold text-lg uppercase">Dinas Komunikasi dan Informatika</h2>
                      <p className="text-xs mt-1">Jl. Tamansari No.55, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132</p>
                    </div>

                    {/* Judul Surat */}
                    <div className="text-center mb-10">
                      <h3 className="font-bold text-lg underline underline-offset-4">SURAT TUGAS</h3>
                      <p className="mt-1">Nomor: {previewAjuan.nomorSurat}</p>
                    </div>

                    {/* Isi */}
                    <div className="space-y-4 text-justify leading-relaxed">
                      <p>Berdasarkan kebutuhan dinas dalam rangka pelaksanaan tugas pada Unit Kerja <strong>{previewAjuan.unitKerja}</strong>, maka Kepala Dinas Komunikasi dan Informatika Provinsi Jawa Barat memberikan tugas kepada:</p>

                      <table className="w-full text-left border-collapse mt-4 mb-4">
                        <tbody>
                          {previewAjuan.pegawaiDitugaskan.map((p, i) => (
                            <tr key={p.id} className="align-top">
                              <td className="w-8 py-1">{i + 1}.</td>
                              <td className="w-24 font-semibold py-1">Nama</td>
                              <td className="w-4 py-1">:</td>
                              <td className="py-1 font-bold">{p.nama}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <p className="mt-4">Untuk melaksanakan tugas kedinasan sebagai berikut:</p>

                      <table className="w-full text-left border-collapse mt-4 mb-4 ml-8 w-[calc(100%-2rem)]">
                        <tbody>
                          <tr className="align-top">
                            <td className="w-40 py-1.5 font-medium">Perihal</td>
                            <td className="w-4 py-1.5">:</td>
                            <td className="py-1.5 font-bold">{previewAjuan.uraianKegiatan}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="w-40 py-1.5 font-medium">Tanggal Pelaksanaan</td>
                            <td className="w-4 py-1.5">:</td>
                            <td className="py-1.5">{formatRentangTanggal(previewAjuan.tanggalMulai, previewAjuan.tanggalSelesai)}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="w-40 py-1.5 font-medium">Lokasi Penugasan</td>
                            <td className="w-4 py-1.5">:</td>
                            <td className="py-1.5">{previewAjuan.lokasiSpesifik}, {previewAjuan.tempat}</td>
                          </tr>
                          <tr className="align-top">
                            <td className="w-40 py-1.5 font-medium">Agenda / Deskripsi</td>
                            <td className="w-4 py-1.5">:</td>
                            <td className="py-1.5 italic">{previewAjuan.deskripsi}</td>
                          </tr>
                        </tbody>
                      </table>

                      <p className="mt-6 pt-4">Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab. Kepada instansi atau pihak terkait mohon bantuan dan kerja samanya.</p>
                    </div>

                    {/* TTD */}
                    <div className="flex justify-end mt-16 pr-8">
                      <div className="text-center">
                        <p>Ditetapkan di Bandung</p>
                        <p className="mb-24">Pada Tanggal, {formatTanggal(previewAjuan.tanggalMulai)}</p>
                        <p className="font-bold underline">KEPALA DINAS</p>
                        <p>NIP. 19700101 199803 1 001</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <a
                    href={`http://localhost:3001/api/tugas/${previewAjuan.id}/download-word`}
                    download
                    className="mr-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Format Asli (Docx)
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewAjuan(null)}
                    className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-900"
                  >
                    Tutup Preview
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
                  <h4 className="font-bold text-slate-900 text-sm">{selectedAjuan.uraianKegiatan}</h4>
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

        </main>
      </div>

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
                  value={formData.uraianKegiatan}
                  onChange={(e) => setFormData({ ...formData, uraianKegiatan: e.target.value })}
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

                    <option value="Fastingkom">Fastingkom</option>
                    <option value="Kepeg">Kepeg</option>
                    <option value="PM">PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pegawai Ditugaskan</label>
                  <select
                    multiple
                    value={formData.pegawaiIds}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, pegawaiIds: options });
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                  >
                    {dummyPegawaiList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.unitKerja})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Tahan tombol Ctrl/Cmd untuk memilih lebih dari satu pegawai.</p>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Domisili Lokasi Penugasan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select required value={formData.provinsiId} onChange={(e) => setFormData({ ...formData, provinsiId: e.target.value, kotaId: '' })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                  </select>
                  <select required value={formData.kotaId} disabled={!formData.provinsiId || isWilayahLoading} onChange={(e) => setFormData({ ...formData, kotaId: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50">
                    <option value="">Pilih Kota/Kabupaten</option>
                    {cities.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Penugasan Spesifik</label>
                <input type="text" required placeholder="Contoh: Kantor, lembaga, atau sekolah tujuan" value={formData.lokasiSpesifik} onChange={(e) => setFormData({ ...formData, lokasiSpesifik: e.target.value })} className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Surat Tugas / Dokumen Pendukung</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-[11px] text-slate-500">Format yang didukung: PDF, Word, Excel.</p>
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
