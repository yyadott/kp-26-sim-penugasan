import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyPegawaiList } from '@/data/dummyData';
import { Search, MoreHorizontal } from 'lucide-react';

export const AjuanPegawaiPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedJabatan, setSelectedJabatan] = useState('ALL');
  const navigate = useNavigate();

  // Get unique lists
  const unitKerjaList = Array.from(new Set(dummyPegawaiList.map(p => p.unitKerja)));
  const roleList = Array.from(new Set(dummyPegawaiList.map(p => p.role || 'PEGAWAI')));
  const jabatanList = Array.from(new Set(dummyPegawaiList.map(p => p.jabatan)));

  const filteredPegawai = dummyPegawaiList.filter((pegawai) => {
    const matchSearch = pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) || pegawai.nip.includes(searchTerm);
    const matchUnit = selectedUnit === 'ALL' || pegawai.unitKerja === selectedUnit;
    const matchRole = selectedRole === 'ALL' || (pegawai.role || 'PEGAWAI') === selectedRole;
    const matchJabatan = selectedJabatan === 'ALL' || pegawai.jabatan === selectedJabatan;
    return matchSearch && matchUnit && matchRole && matchJabatan;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Pegawai</h1>
          <p className="text-sm text-slate-500">Kelola dan lihat daftar seluruh pegawai yang terdaftar di sistem.</p>
        </div>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Unit Kerja</option>
              {unitKerjaList.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Role</option>
              {roleList.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              value={selectedJabatan}
              onChange={(e) => setSelectedJabatan(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Jabatan</option>
              {jabatanList.map(jabatan => (
                <option key={jabatan} value={jabatan}>{jabatan}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Pegawai</th>
                <th className="px-6 py-4 font-semibold">Jabatan</th>
                <th className="px-6 py-4 font-semibold">Unit Kerja</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredPegawai.length > 0 ? (
                filteredPegawai.map((pegawai) => (
                  <tr 
                    key={pegawai.id} 
                    onClick={() => navigate(`/admin/ajuan-pegawai/${pegawai.id}`)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pegawai.fotoAvatar}
                          alt={pegawai.nama}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{pegawai.nama}</p>
                          <p className="text-xs text-slate-500">NIP. {pegawai.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{pegawai.jabatan}</p>
                      <p className="text-xs text-slate-500">{pegawai.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {pegawai.unitKerja}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        pegawai.role === 'SUPER_ADMIN' || pegawai.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 ring-purple-700/10'
                          : 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                      }`}>
                        {pegawai.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-base font-medium text-slate-700">Data tidak ditemukan</p>
                    <p className="mt-1 text-sm">Tidak ada data pegawai yang sesuai dengan kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
