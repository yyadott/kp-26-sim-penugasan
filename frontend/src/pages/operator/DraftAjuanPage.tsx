import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dummyAjuanSuratTugas, dummyPegawaiList } from '@/data/dummyData';
import type { AjuanSuratTugas, UnitKerjaType } from '@/types';
import { Plus, Eye } from 'lucide-react';

const initialFormState = {
  perihal: '',
  unitKerja: 'RBI' as UnitKerjaType,
  pegawaiId: dummyPegawaiList[0].id,
  tanggalMulai: new Date().toISOString().slice(0, 10),
  tanggalSelesai: new Date().toISOString().slice(0, 10),
  lokasiPenugasan: 'Kecamatan Bandung Tengah',
  lokasiSpesifik: '',
  deskripsi: '',
};

export const DraftAjuanPage = () => {
  const [ajuanList, setAjuanList] = useState<AjuanSuratTugas[]>(
    dummyAjuanSuratTugas.filter((item: AjuanSuratTugas) => item.status === 'DRAFT' || item.status === 'VERIFIKASI_SUBBAGIAN')
  );
  const [formData, setFormData] = useState(initialFormState);

  const draftAjuan = useMemo(
    () => ajuanList.filter((item) => item.status === 'DRAFT'),
    [ajuanList]
  );

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedPegawai = dummyPegawaiList.find((p) => p.id === formData.pegawaiId) || dummyPegawaiList[0];
    const newAjuan: AjuanSuratTugas = {
      id: `draft-${Date.now()}`,
      nomorSurat: `DRAFT-ST/${formData.unitKerja.toUpperCase()}/2026/${ajuanList.length + 1}`,
      perihal: formData.perihal,
      pengaju: dummyPegawaiList[0],
      pegawaiDitugaskan: [assignedPegawai],
      unitKerja: formData.unitKerja,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      lokasiPenugasan: formData.lokasiPenugasan,
      lokasiSpesifik: formData.lokasiSpesifik,
      koordinat: [-6.9147, 107.6098],
      deskripsi: formData.deskripsi,
      status: 'DRAFT',
      workflow: [],
    };
    setAjuanList((current) => [newAjuan, ...current]);
    setFormData(initialFormState);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ajuan Draft Penugasan</h1>
            <p className="text-sm text-slate-500">Pindahkan tombol buat draft ajuan ST ke halaman ini untuk operator.</p>
          </div>
          <button
            onClick={() => {
              const input = document.getElementById('draftCreateButton');
              input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Buat Draft Ajuan ST
          </button>
        </div>

        <form id="draftCreateButton" onSubmit={handleCreateDraft} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Perihal Ajuan</span>
              <input
                value={formData.perihal}
                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Unit Kerja</span>
              <select
                value={formData.unitKerja}
                onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value as UnitKerjaType })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="RBI">RBI</option>
                <option value="Fastingkom">Fastingkom</option>
                <option value="Kepeg">Kepeg</option>
                <option value="PM">PM</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Pegawai Ditugaskan</span>
              <select
                value={formData.pegawaiId}
                onChange={(e) => setFormData({ ...formData, pegawaiId: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                {dummyPegawaiList.map((pegawai) => (
                  <option key={pegawai.id} value={pegawai.id}>{pegawai.nama}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Lokasi Spesifik</span>
              <input
                value={formData.lokasiSpesifik}
                onChange={(e) => setFormData({ ...formData, lokasiSpesifik: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Tanggal Mulai</span>
              <input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Tanggal Selesai</span>
              <input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Deskripsi</span>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Simpan Draft Ajuan
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Daftar Ajuan Draft</h2>
            <p className="text-sm text-slate-500">Tabel berisi ajuan draft yang bisa ditinjau lebih lanjut.</p>
          </div>
          <Link to="/operator/proses-ajuan" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Lihat Proses Ajuan Penugasan →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Detail Ajuan Penugasan</th>
                <th className="px-4 py-3">Unit Kerja</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draftAjuan.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{item.perihal}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.nomorSurat}</div>
                  </td>
                  <td className="px-4 py-4">{item.unitKerja}</td>
                  <td className="px-4 py-4">{item.tanggalMulai} s/d {item.tanggalSelesai}</td>
                  <td className="px-4 py-4 text-slate-700 font-semibold">{item.status}</td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </button>
                  </td>
                </tr>
              ))}
              {draftAjuan.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada draft penugasan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
