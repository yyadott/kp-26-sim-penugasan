import { useState } from 'react';
import { Search, MoreHorizontal, ChevronDown, Mail, MapPin, Building, Briefcase, Calendar as CalendarIcon, FileText, CheckCircle2, Clock, XCircle, ArrowLeft, Edit2, Save, KeyRound } from 'lucide-react';
import { usePokja } from '@/hooks/usePokja';
import { dummyPegawaiList, dummyAjuanSuratTugas, getUnitColor } from '@/data/dummyData';
import type { Pegawai } from '@/types';

export const PegawaiPage = () => {
  const { pokjas } = usePokja();
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua Unit Kerja');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [jabatanFilter, setJabatanFilter] = useState('Semua Jabatan');
  
  // State for slide-over panel
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [isEditingPegawai, setIsEditingPegawai] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editMessage, setEditMessage] = useState('');
  
  const handleEditClick = () => {
    if (selectedPegawai) {
      setEditNama(selectedPegawai.nama);
      setEditJabatan(selectedPegawai.jabatan);
      setEditPassword('');
      setEditMessage('');
      setIsEditingPegawai(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedPegawai) {
      // In a real app, send to backend
      selectedPegawai.nama = editNama;
      selectedPegawai.jabatan = editJabatan;
      setEditMessage('Data pegawai berhasil diperbarui!');
      setTimeout(() => {
        setIsEditingPegawai(false);
        setEditMessage('');
      }, 2000);
    }
  };

  // Filter logic for main table
  const filteredPegawai = dummyPegawaiList.filter((pegawai) => {
    const matchesSearch = 
      pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pegawai.nip.includes(searchTerm);
    const matchesUnit = unitFilter === 'Semua Unit Kerja' || pegawai.unitKerja === unitFilter;
    const matchesRole = roleFilter === 'Semua Role' || pegawai.role === roleFilter;
    const matchesJabatan = jabatanFilter === 'Semua Jabatan' || pegawai.jabatan === jabatanFilter;
    
    return matchesSearch && matchesUnit && matchesRole && matchesJabatan;
  });

  // Get assignments for selected employee
  const getPegawaiAssignments = (pegawaiId: string) => {
    const saved = localStorage.getItem('sim_penugasan_tugas');
    const sourceData = saved ? JSON.parse(saved) : dummyAjuanSuratTugas;
    return sourceData.filter((tugas: any) => 
      tugas.pegawaiDitugaskan.some((p: any) => p.id === pegawaiId)
    );
  };

  const pegawaiAssignments = selectedPegawai ? getPegawaiAssignments(selectedPegawai.id) : [];

  if (selectedPegawai) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button 
            onClick={() => {
              setSelectedPegawai(null);
              setIsEditingPegawai(false);
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Detail Pegawai</h1>
            <p className="text-sm text-slate-500 mt-1">Profil lengkap dan riwayat penugasan.</p>
          </div>
          {!isEditingPegawai && (
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Data
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-4 lg:col-span-1 h-fit relative">
            <img 
              src={selectedPegawai.fotoAvatar} 
              alt={selectedPegawai.nama} 
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-md"
            />
            
            {isEditingPegawai ? (
              <div className="w-full space-y-3 mt-2 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editNama} 
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan</label>
                  <input 
                    type="text" 
                    value={editJabatan} 
                    onChange={(e) => setEditJabatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru (Opsional)</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      value={editPassword} 
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak diubah"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {editMessage && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">{editMessage}</p>}
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsEditingPegawai(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedPegawai.nama}</h3>
                  <p className="text-sm font-medium text-blue-600 mt-1">{selectedPegawai.jabatan}</p>
                </div>
                
                <div className="w-full h-px bg-slate-100 my-2"></div>
                
                <div className="w-full flex flex-col gap-3 text-sm text-slate-600 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">NIP</div>
                      <div className="font-semibold text-slate-700">{selectedPegawai.nip}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] text-slate-400 font-medium">Email</div>
                      <div className="font-semibold text-slate-700 truncate">{selectedPegawai.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Unit Kerja</div>
                      <div className="font-semibold text-slate-700">{selectedPegawai.unitKerja}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Role</div>
                      <div className="font-semibold text-slate-700">{selectedPegawai.role}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Riwayat Penugasan</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600">Informasi Surat</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600">Pelaksanaan</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pegawaiAssignments.length > 0 ? (
                    pegawaiAssignments.map((tugas: any) => (
                      <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 align-top">
                          <div className="font-semibold text-slate-800 text-xs">{tugas.nomorSurat}</div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-2" title={tugas.uraianKegiatan}>
                            {tugas.uraianKegiatan}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col gap-1.5 text-[11px] text-slate-600">
                            <div className="flex items-start gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{tugas.tanggalMulai} <br/>s/d {tugas.tanggalSelesai}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="line-clamp-2">{tugas.tempat}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          {tugas.status === 'SURAT_TERBIT' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Disetujui
                            </span>
                          ) : tugas.status === 'DITOLAK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Proses
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-16 text-center text-slate-500 text-sm">
                        Pegawai ini belum memiliki riwayat penugasan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {pokjas.map(p => (
                  <option key={p.id} value={p.kode}>{p.nama} ({p.kode})</option>
                ))}
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
                  const colorCode = getUnitColor(pegawai.unitKerja);
                  const finalUnitClasses = colorCode ? `${colorCode.bg} ${colorCode.text}` : 'bg-blue-50 text-blue-600';
                  const roleBg = pegawai.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-50 text-emerald-600';

                  return (
                    <tr 
                      key={pegawai.id} 
                      className="hover:bg-slate-50/50 transition-colors group bg-white cursor-pointer"
                      onClick={() => setSelectedPegawai(pegawai)}
                    >
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
                        <button 
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            setSelectedPegawai(pegawai);
                          }}
                        >
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
