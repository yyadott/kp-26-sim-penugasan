import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

import type { Pegawai, AjuanSuratTugas, UnitKerjaType } from '@/types';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { usePokja } from '@/hooks/usePokja';
import { sendEmailNotification } from '@/utils/emailService';
import { generateSuratTugas } from '@/utils/generateSuratTugas';
import { FileText, Send, ArrowLeft, Search, Download, AlertTriangle, X } from 'lucide-react';
import apiClient from '@/api/client';

import { useAuth } from '@/hooks/useAuth';
import { dummyPegawaiList } from '@/data/dummyData';

type Wilayah = { id: string; name: string };

const normalizePegawaiId = (id: string) => id.replace(/^peg-0*/, '');

export const BuatTugasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addTugas, tugasList } = useSuratTugas();
  const { pokjas } = usePokja();
  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [isWilayahLoading, setIsWilayahLoading] = useState(false);
  const [pegawaiSearch, setPegawaiSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapMarkerRef = useRef<L.Marker | null>(null);
  
  // Pegawai List from API
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  
  const [conflictAlert, setConflictAlert] = useState<{
    pegawai: { id: string; nama: string; unitKerja: string };
    conflicts: AjuanSuratTugas[];
    isWarningOnly?: boolean;
  } | null>(null);
  
  const [finalSubmitAlert, setFinalSubmitAlert] = useState<{
    pegawai: { id: string; nama: string; unitKerja: string }[];
    isWarningOnly?: boolean;
  } | null>(null);

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    uraianKegiatan: '',
    unitKerja: 'Kepeg' as UnitKerjaType,
    pegawaiIds: [] as string[],
    tanggalMulai: getTodayString(),
    tanggalSelesai: getTodayString(),
    tempat: 'Kecamatan Bandung Tengah',
    lokasiSpesifik: '',
    provinsiId: '',
    kotaId: '',
    koordinatLat: -6.9147,
    koordinatLng: 107.6098,
    deskripsi: '',
    file: null as File | null,
    pangkatGolongan: {} as Record<string, string>,
  });

  // Check if a task is a hard conflict
  const getConflictingTasks = (pegawaiId: string) => {
    const startN = formData.tanggalMulai;
    const endN = formData.tanggalSelesai;
    if (!startN || !endN) return [];
    
    return tugasList.filter((t) => {
      if (t.status === 'DITOLAK') return false;
      const isPegawaiAssigned = t.pegawaiDitugaskan.some((p) => normalizePegawaiId(p.id) === normalizePegawaiId(pegawaiId));
      if (!isPegawaiAssigned) return false;
      
      const startO = t.tanggalMulai;
      const endO = t.tanggalSelesai;
      
      // Check for overlap: new task starts before or on old task's end, AND new task ends after or on old task's start
      const isOverlapping = startN <= endO && endN >= startO;
      if (!isOverlapping) return false;
      
      // It is a warning (not a hard conflict) ONLY IF:
      // 1. New task starts EXACTLY on the last day of the old task (startN === endO)
      // 2. Old task is multi-day (startO < endO)
      // 3. Old task is SURAT_TERBIT
      const isWarning = startN === endO && startO < endO && t.status === 'SURAT_TERBIT';
      
      return !isWarning;
    });
  };

  // Check if a task is a warning (last day overlap)
  const getLastDayIssuedTasks = (pegawaiId: string) => {
    const startN = formData.tanggalMulai;
    const endN = formData.tanggalSelesai;
    if (!startN || !endN) return [];
    
    return tugasList.filter((t) => {
      if (t.status === 'DITOLAK') return false;
      const isPegawaiAssigned = t.pegawaiDitugaskan.some((p) => normalizePegawaiId(p.id) === normalizePegawaiId(pegawaiId));
      if (!isPegawaiAssigned) return false;
      
      const startO = t.tanggalMulai;
      const endO = t.tanggalSelesai;
      
      return startN === endO && startO < endO && t.status === 'SURAT_TERBIT';
    });
  };

  useEffect(() => {
    // Fetch users (pegawai) from backend
    apiClient.get('/users')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPegawaiList(res.data);
        } else {
          setPegawaiList(dummyPegawaiList);
        }
      })
      .catch(err => {
        console.error("Gagal mengambil data pegawai", err);
        setPegawaiList(dummyPegawaiList); // Fallback to dummy data
      });

    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: Wilayah[]) => setProvinces(data))
      .catch(() => setProvinces([]));
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

  // Effect for handling the map initialization and updates
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [formData.koordinatLat, formData.koordinatLng],
        zoom: 10,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: #ef4444; width: 30px; height: 40px; border-radius: 15px 15px 18px 18px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white" opacity="0.9" />
            </svg>
          </div>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40]
      });

      mapMarkerRef.current = L.marker([formData.koordinatLat, formData.koordinatLng], { icon, draggable: true }).addTo(mapInstanceRef.current);
      
      mapMarkerRef.current.on('dragend', function (event) {
        const marker = event.target;
        const position = marker.getLatLng();
        setFormData(prev => ({ ...prev, koordinatLat: position.lat, koordinatLng: position.lng }));
        
        // Reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setFormData(prev => ({ ...prev, lokasiSpesifik: data.display_name }));
            }
          })
          .catch(err => console.error("Reverse geocoding failed", err));
      });
    } else {
      const latlng: [number, number] = [formData.koordinatLat, formData.koordinatLng];
      mapInstanceRef.current.setView(latlng, 12);
      if (mapMarkerRef.current) {
        mapMarkerRef.current.setLatLng(latlng);
      }
    }
  }, [formData.koordinatLat, formData.koordinatLng]);

  const handleActualSubmit = async () => {
    const assignedPegawai = pegawaiList.filter((p) => formData.pegawaiIds.includes(p.id));
    if (assignedPegawai.length === 0) return;
    
    const provinsi = provinces.find((item) => item.id === formData.provinsiId)?.name;
    const kota = cities.find((item) => item.id === formData.kotaId)?.name;
    const newNomor = `DRAFT-ST/${formData.unitKerja.toUpperCase().replace(/\s+/g, '')}/2026/00X`;

    const newAjuan = {
      nomorSurat: newNomor,
      uraianKegiatan: formData.uraianKegiatan,
      pengaju_id: user?.db_id || 1, // Pass the numeric ID to backend
      pegawaiDitugaskan: assignedPegawai.map(p => p.db_id || 1), // Pass array of numeric IDs
      unitKerja: formData.unitKerja,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      tempat: [kota, provinsi].filter(Boolean).join(', ') || formData.tempat,
      koordinatLat: formData.koordinatLat,
      koordinatLng: formData.koordinatLng,
      deskripsi: formData.deskripsi,
      status: 'VERIFIKASI_SUBBAGIAN',
    };

    try {
      await addTugas(newAjuan);
      
      // Kirim notifikasi email ke semua pegawai yang ditugaskan
      for (const pegawai of assignedPegawai) {
        await sendEmailNotification({
          to_email: pegawai.email || 'user@example.com',
          to_name: pegawai.nama,
          nomor_surat: newNomor,
          uraianKegiatan: formData.uraianKegiatan,
          tanggal_mulai: formData.tanggalMulai,
          tanggal_selesai: formData.tanggalSelesai,
          lokasi: [kota, provinsi].filter(Boolean).join(', ') || formData.tempat,
          pesan_tambahan: formData.deskripsi
        });
      }
      alert('Tugas berhasil dibuat dan disimpan di database!');
      navigate('/admin/tugas');
    } catch (err) {
      console.error('Failed to save tugas or send email notifications', err);
      alert('Terjadi kesalahan saat menyimpan tugas.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any selected pegawai has conflicts
    const conflictingSelected = pegawaiList
      .filter((p) => formData.pegawaiIds.includes(p.id))
      .filter((p) => getConflictingTasks(p.id).length > 0);
      
    const warningSelected = pegawaiList
      .filter((p) => formData.pegawaiIds.includes(p.id))
      .filter((p) => getLastDayIssuedTasks(p.id).length > 0 && getConflictingTasks(p.id).length === 0);

    if (conflictingSelected.length > 0) {
      setFinalSubmitAlert({
        pegawai: conflictingSelected.map(p => ({ id: p.id, nama: p.nama, unitKerja: p.unitKerja })),
        isWarningOnly: false
      });
      return;
    }
    
    if (warningSelected.length > 0) {
      setFinalSubmitAlert({
        pegawai: warningSelected.map(p => ({ id: p.id, nama: p.nama, unitKerja: p.unitKerja })),
        isWarningOnly: true
      });
      return;
    }

    handleActualSubmit();
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button 
          onClick={() => navigate('/admin/tugas')}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Buat Tugas Baru</h1>
          <p className="text-sm text-slate-500">Isi formulir berikut dengan teliti untuk membuat draft penugasan baru.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm transition shadow-sm"
        >
          Buat Tugas
        </button>
        <button 
          onClick={() => navigate('/admin/tugas/upload-surat')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition cursor-pointer"
        >
          Upload Tugas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* CARD 1: INFORMASI DASAR */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">1. Informasi Dasar</h2>
            <p className="text-xs text-slate-500">Masukkan perihal dan unit kerja pengaju.</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Uraian Kegiatan Penugasan <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Contoh: Pendampingan Monitoring Posko Kesehatan..."
                value={formData.uraianKegiatan}
                onChange={(e) => setFormData({ ...formData, uraianKegiatan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit Kerja Pengaju <span className="text-red-500">*</span></label>
              <select
                value={formData.unitKerja}
                onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value as UnitKerjaType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
              >
                {pokjas.map(p => (
                  <option key={p.id} value={p.kode}>{p.nama} ({p.kode})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: TANGGAL PENUGASAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">2. Tanggal Penugasan</h2>
            <p className="text-xs text-slate-500">Tentukan rentang tanggal pelaksanaan tugas terlebih dahulu.</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  min={getTodayString()}
                  value={formData.tanggalMulai}
                  onChange={(e) => {
                    const newMulai = e.target.value;
                    let newSelesai = formData.tanggalSelesai;
                    if (newMulai) {
                      if (!newSelesai || newSelesai < newMulai) {
                        newSelesai = newMulai;
                      }
                    }
                    setFormData({ ...formData, tanggalMulai: newMulai, tanggalSelesai: newSelesai });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Selesai <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  min={formData.tanggalMulai || getTodayString()}
                  value={formData.tanggalSelesai}
                  onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: PEGAWAI DITUGASKAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">3. Pegawai yang Ditugaskan</h2>
            <p className="text-xs text-slate-500">Pilih pegawai yang akan melaksanakan tugas. Untuk dinas multi-hari, pegawai ditugaskan pada tanggal terakhir.</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama pegawai..." 
                    value={pegawaiSearch}
                    onChange={(e) => setPegawaiSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
                  />
                </div>
                <select 
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="sm:w-40 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Semua Unit</option>
                  {pokjas.map(p => (
                    <option key={p.id} value={p.kode}>{p.nama} ({p.kode})</option>
                  ))}
                </select>
              </div>

              <div className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 h-40 overflow-y-auto space-y-1 custom-scrollbar">
                {pegawaiList
                  .filter(p =>
                    p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()) &&
                    (unitFilter === '' || p.unitKerja === unitFilter)
                  )
                  .sort((a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }))
                  .map((p) => {
                  const conflicts = getConflictingTasks(p.id);
                  const lastDayIssuedTasks = getLastDayIssuedTasks(p.id);
                  const hasConflict = conflicts.length > 0;
                  const hasWarning = lastDayIssuedTasks.length > 0;
                  const isRed = hasConflict || hasWarning;
                  const isChecked = formData.pegawaiIds.includes(p.id);
                  return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-2 cursor-pointer p-1.5 rounded-md border transition-colors ${
                      isRed && isChecked
                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                        : isRed
                          ? 'bg-red-50/50 border-red-200/60 hover:bg-red-50'
                          : isChecked
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            : 'border-transparent hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      className={`w-4 h-4 rounded cursor-pointer mt-0.5 ${
                        isRed && isChecked
                          ? 'border-red-400 text-red-600 focus:ring-red-500'
                          : 'border-slate-400 text-blue-600 focus:ring-blue-500'
                      }`}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (hasConflict) {
                            setConflictAlert({ pegawai: p, conflicts, isWarningOnly: false });
                            return;
                          } else if (hasWarning) {
                            setConflictAlert({ pegawai: p, conflicts: lastDayIssuedTasks, isWarningOnly: true });
                            return;
                          }
                          setFormData({ ...formData, pegawaiIds: [...formData.pegawaiIds, p.id] });
                        } else {
                          setFormData({ ...formData, pegawaiIds: formData.pegawaiIds.filter(id => id !== p.id) });
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${isRed ? 'text-red-600' : 'text-slate-700'}`}>
                        {p.nama} <span className={`text-xs font-normal ${isRed ? 'text-red-400' : 'text-slate-500'}`}>({p.unitKerja})</span>
                      </span>
                      {hasConflict && (
                        <div className="flex items-start gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] text-red-500 leading-tight">
                            Sedang Ditugaskan — Bentrok {conflicts.length} tugas
                          </span>
                        </div>
                      )}
                      {hasWarning && !hasConflict && (
                        <div className="flex items-start gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[11px] text-red-500 leading-tight">
                            Hari terakhir surat tugas sebelumnya
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                  );
                })}
                {pegawaiList
                  .filter(p =>
                    p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()) &&
                    (unitFilter === '' || p.unitKerja === unitFilter)
                  ).length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-4">Pegawai tidak ditemukan dengan pencarian tersebut.</div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">💡 Centang kotak di samping nama pegawai untuk memilih.</p>
            </div>


            {formData.pegawaiIds.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-2">Lengkapi Data Pangkat & Golongan <span className="text-red-500">*</span></h3>
                <p className="text-xs text-slate-600 mb-3">Data ini wajib diisi karena akan dicetak langsung pada file Word Surat Tugas.</p>
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {formData.pegawaiIds.map(id => {
                    const peg = pegawaiList.find(p => p.id === id);
                    if (!peg) return null;
                    return (
                      <div key={id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 sm:w-1/3 truncate">{peg.nama}</span>
                        <input
                          type="text"
                          required
                          placeholder="Cth: Pembina Utama Muda, IV/c"
                          value={formData.pangkatGolongan[id] || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pangkatGolongan: { ...prev.pangkatGolongan, [id]: e.target.value }
                          }))}
                          className="flex-1 w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: LOKASI PELAKSANAAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">4. Lokasi Pelaksanaan</h2>
            <p className="text-xs text-slate-500">Tentukan di mana tugas ini dilaksanakan.</p>
          </div>
          <div className="p-5 space-y-4">

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Domisili (Provinsi & Kota) <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select required value={formData.provinsiId} onChange={(e) => setFormData({ ...formData, provinsiId: e.target.value, kotaId: '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors">
                  <option value="">-- Pilih Provinsi --</option>
                  {provinces.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                </select>
                <select required value={formData.kotaId} disabled={!formData.provinsiId || isWilayahLoading} onChange={(e) => setFormData({ ...formData, kotaId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-200 bg-slate-50 hover:bg-white transition-colors">
                  <option value="">-- Pilih Kota/Kabupaten --</option>
                  {cities.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">💡 Pilih Provinsi terlebih dahulu untuk memunculkan daftar Kota.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tempat Spesifik <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="text" required placeholder="Contoh: SMKN 1 Bandung, Jl. Wastukencana No.3" value={formData.lokasiSpesifik} onChange={(e) => setFormData({ ...formData, lokasiSpesifik: e.target.value })} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors" />
                <button type="button" onClick={() => {
                  if (formData.lokasiSpesifik) {
                    const query = encodeURIComponent(formData.lokasiSpesifik);
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=id`)
                      .then(res => res.json())
                      .then(data => {
                        if (data && data.length > 0) {
                          setFormData(prev => ({
                            ...prev,
                            koordinatLat: parseFloat(data[0].lat),
                            koordinatLng: parseFloat(data[0].lon)
                          }));
                        } else {
                          const firstPart = formData.lokasiSpesifik.split(',')[0].trim();
                          if (firstPart && firstPart !== formData.lokasiSpesifik) {
                            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(firstPart)}&countrycodes=id`)
                              .then(res => res.json())
                              .then(data2 => {
                                if (data2 && data2.length > 0) {
                                  setFormData(prev => ({ ...prev, koordinatLat: parseFloat(data2[0].lat), koordinatLng: parseFloat(data2[0].lon) }));
                                  alert(`Lokasi spesifik persis tidak ditemukan, namun berhasil menemukan "${firstPart}". Pin peta telah digeser.`);
                                } else {
                                  alert("Lokasi tidak ditemukan di peta. OpenStreetMap mungkin tidak mengenali alamat lengkap ini.\n\nTips: Coba gunakan kata kunci yang lebih pendek (contoh: 'Pasar Induk Caringin') atau geser pin merah di peta secara manual.");
                                }
                              });
                          } else {
                            alert("Lokasi tidak ditemukan di peta. OpenStreetMap mungkin tidak mengenali nama tempat ini.\n\nTips: Coba gunakan nama tempat yang lebih umum atau geser pin merah di peta secara manual.");
                          }
                        }
                      })
                      .catch(err => console.error("Geocoding failed", err));
                  }
                }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                  <Search className="w-4 h-4" /> Cari di Peta
                </button>
              </div>
              {formData.tanggalMulai && formData.tanggalSelesai && formData.tanggalMulai < formData.tanggalSelesai && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  Pegawai hanya ditugaskan pada tanggal {formData.tanggalSelesai}; tanggal {formData.tanggalMulai} tidak dapat digunakan untuk penugasan pegawai.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Preview Titik Lokasi Peta</label>
              <div className="w-full h-[250px] bg-slate-100 rounded-lg border border-slate-300 overflow-hidden relative z-0">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">💡 Geser pin pada peta untuk menentukan lokasi spesifik secara otomatis, atau ketik lokasi lalu klik "Cari di Peta".</p>
            </div>
          </div>
        </div>

        {/* CARD 5: DESKRIPSI & LAMPIRAN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800">5. Deskripsi & Lampiran (Opsional)</h2>
            <p className="text-xs text-slate-500">Informasi tambahan dan dokumen pendukung.</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Tugas</label>
              <textarea
                rows={3}
                placeholder="Penjelasan rinci mengenai agenda, output yang diharapkan, dll..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload File Pendukung (Opsional)</label>
              <div className="mt-1 flex justify-center px-4 pt-5 pb-5 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="space-y-2 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-transparent rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1">
                      <span>Klik di sini untuk memilih file</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Mendukung format PDF, Word, Excel (Maks. 10MB)</p>
                  {formData.file && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md inline-block">
                      <p className="text-sm font-bold text-emerald-700">
                        File Terpilih: {formData.file.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 bg-white border-t border-slate-200 p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-end gap-2.5 px-5">
          <button
            type="button"
            onClick={() => navigate('/admin/tugas')}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={() => {
              const assignedPegawai = pegawaiList.filter((p) => formData.pegawaiIds.includes(p.id));
              if (assignedPegawai.length === 0) {
                alert('Pilih minimal 1 pegawai untuk generate surat tugas.');
                return;
              }
              
              // Validation for pangkatGolongan
              let missingPangkat = false;
              for (const pid of formData.pegawaiIds) {
                if (!formData.pangkatGolongan[pid] || formData.pangkatGolongan[pid].trim() === '') {
                  missingPangkat = true;
                  break;
                }
              }
              if (missingPangkat) {
                 alert('Mohon isi Pangkat & Golongan untuk setiap pegawai yang dipilih sebelum mencetak Surat Tugas.');
                 return;
              }

              const provinsi = provinces.find((item) => item.id === formData.provinsiId)?.name || '';
              const kota = cities.find((item) => item.id === formData.kotaId)?.name || '';
              const lokasiGabungan = [kota, provinsi].filter(Boolean).join(', ') || formData.tempat;
              const newNomor = `DRAFT-ST/${formData.unitKerja.toUpperCase().replace(/\s+/g, '')}/2026/00X`;

              generateSuratTugas({
                nomorSurat: newNomor,
                uraianKegiatan: formData.uraianKegiatan || '-',
                pegawaiList: assignedPegawai.map((p) => ({
                  nama: p.nama,
                  nip: p.nip,
                  pangkat: formData.pangkatGolongan[p.id] || '-',
                  jabatan: p.jabatan,
                })),
                tanggalMulai: formData.tanggalMulai,
                tanggalSelesai: formData.tanggalSelesai,
                lokasi: lokasiGabungan,
                lokasiSpesifik: formData.lokasiSpesifik,
                deskripsi: formData.deskripsi,
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Cetak Word (.docx)</span>
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Simpan Tugas</span>
          </button>
        </div>
      </form>

      {/* CONFLICT ALERT MODAL */}
      {conflictAlert && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800">Peringatan Bentrok Jadwal</h3>
                  <p className="text-sm text-red-600">Pegawai sudah memiliki tugas lain</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setConflictAlert(null)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-700">
                {conflictAlert.isWarningOnly ? (
                  <>
                    Apakah Anda akan tetap memberi surat tugas untuk <strong>{conflictAlert.pegawai.nama}</strong>?
                    Pegawai ini sudah memiliki surat tugas yang berjalan pada tanggal {tanggalPenugasanPegawai} (hari terakhir penugasannya).
                  </>
                ) : (
                  <>
                    Pegawai <strong>{conflictAlert.pegawai.nama}</strong> sudah memiliki surat tugas penuh pada tanggal {tanggalPenugasanPegawai}. Pegawai tidak dapat ditugaskan pada rentang tanggal ini.
                  </>
                )}
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detail Bentrok:</div>
                {conflictAlert.conflicts.map(c => (
                  <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                    <div className="text-[11px] font-bold text-red-600">{c.nomorSurat}</div>
                    <div className="text-sm text-slate-700 font-medium leading-snug">{c.uraianKegiatan}</div>
                    <div className="text-xs text-slate-500">{c.tanggalMulai} s/d {c.tanggalSelesai}</div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setConflictAlert(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Batal
                </button>
                {conflictAlert.isWarningOnly ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, pegawaiIds: [...prev.pegawaiIds, conflictAlert.pegawai.id] }));
                      setConflictAlert(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Tetap Beri Tugas
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConflictAlert(null)}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Mengerti
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FINAL SUBMIT ALERT MODAL */}
      {finalSubmitAlert && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 border-b border-red-100 p-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800">Konfirmasi Simpan Tugas</h3>
                  <p className="text-sm text-red-600">Ada pegawai yang bentrok jadwal</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFinalSubmitAlert(null)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-700">
                {finalSubmitAlert.isWarningOnly ? (
                  <>Apakah Anda akan tetap memberi surat tugas untuk <strong>{finalSubmitAlert.pegawai.map(p => p.nama).join(', ')}</strong>?</>
                ) : (
                  <>Anda memilih <strong>{finalSubmitAlert.pegawai.length} pegawai</strong> yang sudah memiliki surat tugas penuh pada tanggal penugasan. Harap hapus pegawai tersebut dari daftar sebelum menyimpan.</>
                )}
              </p>
              
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {finalSubmitAlert.pegawai.map(p => (
                  <div key={p.id} className="text-sm text-slate-700 font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {p.nama} <span className="text-xs text-slate-500 font-normal">({p.unitKerja})</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setFinalSubmitAlert(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Kembali
                </button>
                {finalSubmitAlert.isWarningOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setFinalSubmitAlert(null);
                      handleActualSubmit();
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    Tetap Simpan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
