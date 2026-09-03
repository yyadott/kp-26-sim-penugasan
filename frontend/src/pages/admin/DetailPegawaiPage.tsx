import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Mail, Building2, UserCircle, Activity } from 'lucide-react';
import { usePegawai } from '@/hooks/usePegawai';
import { useSuratTugas } from '@/hooks/useSuratTugas';

export const DetailPegawaiPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { pegawaiList } = usePegawai();
  const { tugasList } = useSuratTugas();

  const pegawai = pegawaiList.find(p => String(p.id) === String(id));
  const assignedTasks = tugasList.filter(t => t.pegawaiDitugaskan.some(p => String(p.id) === String(id)));

  if (!pegawai) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <UserCircle className="h-16 w-16 text-slate-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pegawai Tidak Ditemukan</h2>
          <p className="mt-1 text-slate-500">ID Pegawai tidak terdaftar di sistem.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profil Pegawai</h1>
          <p className="text-sm text-slate-500">Detail informasi dan riwayat aktifitas pegawai.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Biodata Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <img
                src={pegawai.fotoAvatar || 'https://via.placeholder.com/150'}
                alt={pegawai.nama}
                className="h-28 w-28 rounded-full border-4 border-slate-50 object-cover shadow-sm"
              />
              <h2 className="mt-4 text-xl font-bold text-slate-800">{pegawai.nama}</h2>
              <p className="font-medium text-slate-500">NIP. {pegawai.nip}</p>

              <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${pegawai.role === 'SUPER_ADMIN' || pegawai.role === 'ADMIN'
                  ? 'bg-purple-50 text-purple-700 ring-purple-700/10'
                  : 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                }`}>
                {pegawai.role}
              </span>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Jabatan</p>
                  <p className="text-sm font-medium text-slate-800">{pegawai.jabatan}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Unit Kerja</p>
                  <p className="text-sm font-medium text-slate-800">{pegawai.unitKerja}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-800 break-all">{pegawai.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Tasks Table */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Daftar Penugasan ({assignedTasks.length})</h3>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Tanggal</th>
                    <th className="px-6 py-3 font-semibold">Uraian Tugas</th>
                    <th className="px-6 py-3 font-semibold">Unit Kerja</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {assignedTasks.length > 0 ? (
                    assignedTasks.map((tugas) => (
                      <tr key={tugas.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {tugas.tanggalMulai} <br /><span className="text-xs">s/d {tugas.tanggalSelesai}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate" title={tugas.uraianKegiatan}>{tugas.uraianKegiatan}</td>
                        <td className="px-6 py-4 text-slate-600">{tugas.unitKerja}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tugas.status === 'SURAT_TERBIT' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                              tugas.status === 'DITOLAK' ? 'bg-rose-50 text-rose-700 ring-rose-600/10' :
                                'bg-amber-50 text-amber-700 ring-amber-600/10'
                            }`}>
                            {tugas.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Belum ada penugasan untuk pegawai ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
