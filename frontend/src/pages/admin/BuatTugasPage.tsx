import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyPegawaiList } from '@/data/dummyData';
import type { AjuanSuratTugas, UnitKerjaType } from '@/types';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { sendEmailNotification } from '@/utils/emailService';
import { FileText, Send, ArrowLeft, Search } from 'lucide-react';

type Wilayah = { id: string; name: string };

export const BuatTugasPage = () => {
  const navigate = useNavigate();
  const { addTugas } = useSuratTugas();
  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [isWilayahLoading, setIsWilayahLoading] = useState(false);
  const [pegawaiSearch, setPegawaiSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  const [formData, setFormData] = useState({
    perihal: '',
    unitKerja: 'RBI' as UnitKerjaType,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedPegawai = dummyPegawaiList.filter((p) => formData.pegawaiIds.includes(p.id));
    if (assignedPegawai.length === 0) assignedPegawai.push(dummyPegawaiList[0]);
    
    const provinsi = provinces.find((item) => item.id === formData.provinsiId)?.name;
    const kota = cities.find((item) => item.id === formData.kotaId)?.name;
    const newId = `st-new-${Date.now()}`;
    const newNomor = `DRAFT-ST/${formData.unitKerja.toUpperCase().replace(/\s+/g, '')}/2026/00X`;

    const newAjuan: AjuanSuratTugas = {
      id: newId,
      nomorSurat: newNomor,
      perihal: formData.perihal,
      pengaju: dummyPegawaiList[0], // Logged in user
      pegawaiDitugaskan: assignedPegawai,
      unitKerja: formData.unitKerja,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      lokasiPenugasan: [kota, provinsi].filter(Boolean).join(', ') || formData.lokasiPenugasan,
      lokasiSpesifik: formData.lokasiSpesifik,
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
          catatan: 'Draft baru telah diajukan dari Admin.',
        }
      ],
    };

    addTugas(newAjuan);
    
    // Kirim notifikasi email ke semua pegawai yang ditugaskan
    try {
      for (const pegawai of assignedPegawai) {
        await sendEmailNotification({
          to_email: pegawai.email || 'user@example.com',
          to_name: pegawai.nama,
          nomor_surat: newAjuan.nomorSurat,
          perihal: newAjuan.perihal,
          tanggal_mulai: newAjuan.tanggalMulai,
          tanggal_selesai: newAjuan.tanggalSelesai,
          lokasi: newAjuan.lokasiPenugasan,
          pesan_tambahan: newAjuan.deskripsi
        });
      }
    } catch (err) {
      console.error('Failed to send email notifications', err);
    }

    alert('Tugas berhasil dibuat dan notifikasi email telah dikirim!');
    navigate('/admin/tugas');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button 
          onClick={() => navigate('/admin/tugas')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buat Tugas Baru</h1>
          <p className="text-sm text-slate-500">Isi formulir berikut untuk membuat draft penugasan baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Perihal Penugasan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pendampingan Monitoring Posko Kesehatan..."
                value={formData.perihal}
                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Unit Kerja Pengaju</label>
                <select
                  value={formData.unitKerja}
                  onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value as UnitKerjaType })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                >
                  <option value="RBI">RBI</option>
                  <option value="Fastingkom">Fastingkom</option>
                  <option value="Kepeg">Kepeg</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pegawai Ditugaskan</label>
                
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
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
                    className="sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Semua Unit</option>
                    <option value="RBI">RBI</option>
                    <option value="Fastingkom">Fastingkom</option>
                    <option value="Kepeg">Kepeg</option>
                    <option value="PM">PM</option>
                  </select>
                </div>

                <div className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 h-32 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {dummyPegawaiList
                    .filter(p => p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()) && (unitFilter === '' || p.unitKerja === unitFilter))
                    .map((p) => (
                    <label key={p.id} className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={formData.pegawaiIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, pegawaiIds: [...formData.pegawaiIds, p.id] });
                          } else {
                            setFormData({ ...formData, pegawaiIds: formData.pegawaiIds.filter(id => id !== p.id) });
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700 font-medium">{p.nama} <span className="text-slate-500 font-normal">({p.unitKerja})</span></span>
                    </label>
                  ))}
                  {dummyPegawaiList.filter(p => p.nama.toLowerCase().includes(pegawaiSearch.toLowerCase()) && (unitFilter === '' || p.unitKerja === unitFilter)).length === 0 && (
                    <div className="text-center text-xs text-slate-500 py-4">Pegawai tidak ditemukan</div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Pilih satu atau lebih pegawai dengan mencentang kotak.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formData.tanggalMulai}
                  onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={formData.tanggalSelesai}
                  onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Domisili Lokasi Penugasan</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select required value={formData.provinsiId} onChange={(e) => setFormData({ ...formData, provinsiId: e.target.value, kotaId: '' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors">
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                </select>
                <select required value={formData.kotaId} disabled={!formData.provinsiId || isWilayahLoading} onChange={(e) => setFormData({ ...formData, kotaId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 bg-slate-50 hover:bg-white transition-colors">
                  <option value="">Pilih Kota/Kabupaten</option>
                  {cities.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Lokasi Penugasan Spesifik</label>
              <input type="text" required placeholder="Contoh: Kantor, lembaga, atau sekolah tujuan" value={formData.lokasiSpesifik} onChange={(e) => setFormData({ ...formData, lokasiSpesifik: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi Tugas</label>
              <textarea
                rows={4}
                placeholder="Penjelasan rinci mengenai agenda dan uraian tugas..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Upload Surat Tugas / Dokumen Pendukung</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="space-y-2 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Pilih file</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      />
                    </label>
                    <p className="pl-1">atau tarik dan lepas file di sini</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF, Word, Excel hingga 10MB</p>
                  {formData.file && (
                    <p className="text-sm font-bold text-emerald-600 mt-2">
                      File terpilih: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/tugas')}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Simpan Tugas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
