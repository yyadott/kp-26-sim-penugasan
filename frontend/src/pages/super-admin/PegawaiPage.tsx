import { useState } from 'react';
import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';
import { dummyPegawaiList, UNIT_COLORS } from '@/data/dummyData';

export const PegawaiPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua Unit Kerja');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [jabatanFilter, setJabatanFilter] = useState('Semua Jabatan');



  // Filter logic
  const filteredPegawai = dummyPegawaiList.filter((pegawai) => {
    const matchesSearch = 
      pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pegawai.nip.includes(searchTerm);
    const matchesUnit = unitFilter === 'Semua Unit Kerja' || pegawai.unitKerja === unitFilter;
    const matchesRole = roleFilter === 'Semua Role' || pegawai.role === roleFilter;
    const matchesJabatan = jabatanFilter === 'Semua Jabatan' || pegawai.jabatan === jabatanFilter;
    
    return matchesSearch && matchesUnit && matchesRole && matchesJabatan;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Pegawai</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola dan lihat daftar seluruh pegawai yang terdaftar di sistem.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau NIP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative min-w-[170px] flex-1 md:flex-none">
              <select 
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option>Semua Unit Kerja</option>
                <option>RBI</option>
                <option>Fastingkom</option>
                <option>Kepeg</option>
                <option>PM</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[150px] flex-1 md:flex-none">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option>Semua Role</option>
                <option>SUPER_ADMIN</option>
                <option>PEGAWAI</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[180px] flex-1 md:flex-none">
              <select 
                value={jabatanFilter}
                onChange={(e) => setJabatanFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option>Semua Jabatan</option>
                <option>Super Admin</option>
                <option>Front Office</option>
                <option>Koordinator Pengawasan Lalu Lintas</option>
                <option>Kasi Penertiban & Operasional</option>
                <option>Subkoordinator Pemeliharaan Jalan</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Pegawai</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Jabatan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Unit Kerja</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPegawai.length > 0 ? (
                filteredPegawai.map((pegawai) => {
                  // Wait, actually I will just use UNIT_COLORS for uniqueness if they prefer,
                  // but the image shows mostly blue for all of them. Let's use UNIT_COLORS if available, fallback to blue.
                  const colorCode = UNIT_COLORS[pegawai.unitKerja];
                  const finalUnitClasses = colorCode ? `${colorCode.bg} ${colorCode.text}` : 'bg-blue-50 text-blue-600';

                  const roleBg = pegawai.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-50 text-emerald-600';

                  return (
                    <tr key={pegawai.id} className="hover:bg-slate-50/50 transition-colors group bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={pegawai.fotoAvatar} 
                            alt={pegawai.nama} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-white"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-[14px]">{pegawai.nama}</div>
                            <div className="text-[13px] text-slate-400 font-medium mt-0.5">NIP. {pegawai.nip}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-600 text-[14px]">{pegawai.jabatan}</div>
                          <div className="text-[13px] text-slate-400 mt-0.5">{pegawai.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${finalUnitClasses}`}>
                          {pegawai.unitKerja}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${roleBg}`}>
                          {pegawai.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pegawai yang ditemukan.
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
