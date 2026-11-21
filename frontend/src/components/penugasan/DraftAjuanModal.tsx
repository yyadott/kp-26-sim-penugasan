import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { dummyPegawaiList } from '@/data/dummyData';
import type { AjuanSuratTugas, UnitKerjaType } from '@/types';

type Wilayah = { id: string; name: string };

type DraftAjuanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ajuan: AjuanSuratTugas) => void;
  nextNumber: number;
};

const getLocalDate = (offsetDays = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

export const DraftAjuanModal = ({ isOpen, onClose, onSubmit, nextNumber }: DraftAjuanModalProps) => {
  const tomorrow = getLocalDate(1);
  const [provinces, setProvinces] = useState<Wilayah[]>([]);
  const [cities, setCities] = useState<Wilayah[]>([]);
  const [regionError, setRegionError] = useState('');
  const [formData, setFormData] = useState({
    uraianKegiatan: '',
    unitKerja: 'Kepeg' as UnitKerjaType,
    pegawaiId: dummyPegawaiList[0].id,
    provinceId: '',
    cityId: '',
    lokasiSpesifik: '',
    tanggalMulai: getLocalDate(),
    tanggalSelesai: tomorrow,
    deskripsi: '',
  });

  useEffect(() => {
    if (!isOpen || provinces.length > 0) return;

    const controller = new AbortController();
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Gagal memuat provinsi');
        return response.json() as Promise<Wilayah[]>;
      })
      .then(setProvinces)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRegionError('Data provinsi tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.');
      })

    return () => controller.abort();
  }, [isOpen, provinces.length]);

  useEffect(() => {
    if (!formData.provinceId) return;

    const controller = new AbortController();
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.provinceId}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Gagal memuat kota/kabupaten');
        return response.json() as Promise<Wilayah[]>;
      })
      .then(setCities)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRegionError('Data kota/kabupaten tidak dapat dimuat. Silakan pilih provinsi lain atau coba lagi.');
      })

    return () => controller.abort();
  }, [formData.provinceId]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const assignedPegawai = dummyPegawaiList.find((pegawai) => pegawai.id === formData.pegawaiId) ?? dummyPegawaiList[0];
    const province = provinces.find((item) => item.id === formData.provinceId);
    const city = cities.find((item) => item.id === formData.cityId);
    if (!province || !city) {
      setRegionError('Pilih provinsi dan kota/kabupaten domisili terlebih dahulu.');
      return;
    }

    onSubmit({
      id: `draft-${Date.now()}`,
      nomorSurat: `DRAFT-ST/${formData.unitKerja}/2026/${nextNumber}`,
      uraianKegiatan: formData.uraianKegiatan,
      pengaju: dummyPegawaiList[0],
      pegawaiDitugaskan: [assignedPegawai],
      unitKerja: formData.unitKerja,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      tempat: `${city.name}, ${province.name}`,
      lokasiSpesifik: formData.lokasiSpesifik,
      koordinat: [-6.9147, 107.6098],
      deskripsi: formData.deskripsi,
      status: 'DRAFT',
      workflow: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="draft-ajuan-title">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-3xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 id="draft-ajuan-title" className="text-xl font-bold text-slate-900">Buat Draft Ajuan ST</h2>
            <p className="mt-1 text-sm text-slate-500">Lengkapi data penugasan sebelum menyimpan draft.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup formulir">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700"><span>Uraian Kegiatan Ajuan</span><input required value={formData.uraianKegiatan} onChange={(event) => setFormData({ ...formData, uraianKegiatan: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Unit Kerja</span><select value={formData.unitKerja} onChange={(event) => setFormData({ ...formData, unitKerja: event.target.value as UnitKerjaType })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">{(['Kepeg', 'Fastingkom', 'PM'] as UnitKerjaType[]).map((unit) => <option key={unit}>{unit}</option>)}</select></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Pegawai Ditugaskan</span><select value={formData.pegawaiId} onChange={(event) => setFormData({ ...formData, pegawaiId: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">{dummyPegawaiList.map((pegawai) => <option key={pegawai.id} value={pegawai.id}>{pegawai.nama}</option>)}</select></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Lokasi/Tempat Penugasan</span><input required placeholder="Contoh: Kantor Kecamatan Bandung Tengah" value={formData.lokasiSpesifik} onChange={(event) => setFormData({ ...formData, lokasiSpesifik: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700"><span>Provinsi Domisili</span><select required value={formData.provinceId} onChange={(event) => { setCities([]); setRegionError(''); setFormData({ ...formData, provinceId: event.target.value, cityId: '' }); }} disabled={provinces.length === 0 && !regionError} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"> <option value="">{provinces.length === 0 && !regionError ? 'Memuat provinsi...' : 'Pilih provinsi'}</option>{provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}</select></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Kota/Kabupaten Domisili</span><select required value={formData.cityId} onChange={(event) => setFormData({ ...formData, cityId: event.target.value })} disabled={!formData.provinceId || (cities.length === 0 && !regionError)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"><option value="">{cities.length === 0 && !regionError ? 'Memuat kota/kabupaten...' : 'Pilih kota/kabupaten'}</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
        </div>
        {regionError && <p className="text-sm text-rose-600">{regionError}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700"><span>Tanggal Mulai</span><input type="date" value={formData.tanggalMulai} onChange={(event) => setFormData({ ...formData, tanggalMulai: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" /></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Tanggal Selesai</span><input required type="date" min={tomorrow} value={formData.tanggalSelesai} onChange={(event) => setFormData({ ...formData, tanggalSelesai: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" /></label>
        </div>

        <label className="block space-y-2 text-sm text-slate-700"><span>Deskripsi</span><textarea rows={4} value={formData.deskripsi} onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400" /></label>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Simpan Draft</button></div>
      </form>
    </div>
  );
};
