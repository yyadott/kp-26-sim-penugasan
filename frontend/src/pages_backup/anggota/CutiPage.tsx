import { useState } from 'react';
import { CheckCircle2, FilePlus2, Send } from 'lucide-react';

type JenisPengajuan = 'IZIN' | 'CUTI';

interface PengajuanCuti {
  id: number;
  jenis: JenisPengajuan;
  mulai: string;
  selesai: string;
  alasan: string;
}

const formatTanggal = (tanggal: string) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'long', year: 'numeric',
}).format(new Date(`${tanggal}T00:00:00`));

const tanggalHariIni = () => {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
  const tanggal = String(sekarang.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${tanggal}`;
};

export const CutiPage = () => {
  const [jenis, setJenis] = useState<JenisPengajuan>('CUTI');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [alasan, setAlasan] = useState('');
  const [pengajuan, setPengajuan] = useState<PengajuanCuti[]>([]);
  const [pesan, setPesan] = useState('');
  const hariIni = tanggalHariIni();

  const kirimPengajuan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (tanggalMulai < hariIni || tanggalSelesai < hariIni) {
      setPesan('Tanggal pengajuan tidak boleh menggunakan tanggal yang sudah lewat.');
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setPesan('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }
    setPengajuan((sebelumnya) => [{ id: Date.now(), jenis, mulai: tanggalMulai, selesai: tanggalSelesai, alasan: alasan.trim() }, ...sebelumnya]);
    setTanggalMulai('');
    setTanggalSelesai('');
    setAlasan('');
    setPesan(`Pengajuan ${jenis.toLowerCase()} berhasil dikirim dan menunggu persetujuan.`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Izin & Cuti</p>
        <h2 className="mt-2 text-2xl font-semibold">Ajukan izin atau cuti</h2>
        <p className="mt-2 text-sm text-slate-300">Lengkapi data pengajuan. Permohonan akan diteruskan kepada atasan untuk disetujui.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-800">Form pengajuan</h3></div>
          <form onSubmit={kirimPengajuan} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Jenis pengajuan<select value={jenis} onChange={(event) => setJenis(event.target.value as JenisPengajuan)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"><option value="CUTI">Cuti</option><option value="IZIN">Izin</option></select></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700">Mulai<input required type="date" min={hariIni} value={tanggalMulai} onChange={(event) => setTanggalMulai(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" /></label><label className="text-sm font-medium text-slate-700">Selesai<input required type="date" min={tanggalMulai || hariIni} value={tanggalSelesai} onChange={(event) => setTanggalSelesai(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" /></label></div></div>
            <label className="block text-sm font-medium text-slate-700">Alasan<textarea required value={alasan} onChange={(event) => setAlasan(event.target.value)} rows={4} placeholder="Jelaskan keperluan izin atau cuti Anda" className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" /></label>
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Send className="h-4 w-4" /> Kirim pengajuan</button>
          </form>
          {pesan && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{pesan}</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold text-slate-800">Status pengajuan</h3><p className="mt-1 text-sm text-slate-500">Riwayat pengajuan yang Anda kirim.</p><div className="mt-4 space-y-3">{pengajuan.length ? pengajuan.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-800">{item.jenis}</p><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">MENUNGGU</span></div><p className="mt-2 text-sm text-slate-600">{formatTanggal(item.mulai)} – {formatTanggal(item.selesai)}</p><p className="mt-1 text-sm text-slate-500">{item.alasan}</p></div>) : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Belum ada pengajuan izin atau cuti.</div>}</div></section>
      </div>
    </div>
  );
};
