import React, { useState, useEffect, useRef } from 'react';
import { useSuratTugas } from '@/hooks/useSuratTugas';

import { useAuth } from '@/hooks/useAuth';
import { extractDocxContent } from '@/utils/documentScanner';
import {
  FileText, CheckCircle2, XCircle, Clock, Download,
  MapPin, Calendar as CalendarIcon, Users, Upload, X, Search, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

// Simulasi pengiriman notifikasi eksternal
const sendTelegramNotification = async (_message: string) => {
  return new Promise(resolve => setTimeout(resolve, 800)); // Simulasi delay
};

const sendEmailNotification = async (_to_name: string, _message: string) => {
  return new Promise(resolve => setTimeout(resolve, 800)); // Simulasi delay
};

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const ApprovalTugasPage = () => {
  const { user } = useAuth();
  const { tugasList, refreshTugas, updateTugasStatus } = useSuratTugas();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<any[] | null>(null);
  const [selectedSurat, setSelectedSurat] = useState<any | null>(null);

  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);

  // States for Upload Modal & Validation
  const [uploadModalTugas, setUploadModalTugas] = useState<any | null>(null);
  const [uploadAndApproveMode, setUploadAndApproveMode] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // Fungsi validasi keberadaan file dan ekstensi (.pdf, .doc, .docx)
  const validateSuratFile = (file: File | null): { valid: boolean; title: string; message: string } => {
    if (!file) {
      return {
        valid: false,
        title: 'File Belum Dipilih!',
        message: 'Silakan pilih file surat tugas terlebih dahulu sebelum mengunggah.',
      };
    }

    const lastDotIndex = file.name.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? file.name.substring(lastDotIndex).toLowerCase() : '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        title: 'Format File Tidak Sesuai!',
        message: `File "${file.name}" memiliki format yang tidak didukung. Sistem hanya menerima file surat tugas dengan ekstensi .pdf, .doc, atau .docx.`,
      };
    }

    return { valid: true, title: '', message: '' };
  };

  const openUploadModal = (tugas: any, approveAfterUpload = false) => {
    setUploadModalTugas(tugas);
    setUploadAndApproveMode(approveAfterUpload);
    setSelectedUploadFile(null);
    setUploadErrorMsg(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const closeUploadModal = () => {
    setUploadModalTugas(null);
    setUploadAndApproveMode(false);
    setSelectedUploadFile(null);
    setUploadErrorMsg(null);
  };

  const handleUploadFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedUploadFile(null);
      setUploadErrorMsg('File surat tugas belum dipilih! Silakan pilih file terlebih dahulu.');
      return;
    }

    const file = files[0];
    setSelectedUploadFile(file);

    const validation = validateSuratFile(file);
    if (!validation.valid) {
      setUploadErrorMsg(validation.message);
      Swal.fire({
        title: validation.title,
        text: validation.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } else {
      setUploadErrorMsg(null);
    }
  };

  // refresh on mount
  useEffect(() => {
    refreshTugas();
  }, []);

  // States for Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [previewDocName, setPreviewDocName] = useState<string>('');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const handlePreviewUploadedFile = async (file: File) => {
    setPreviewDocName(`Preview Attachment: ${file.name}`);
    setPreviewModalOpen(true);
    setPreviewPdfUrl(null);
    setPreviewHtml('');
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const url = URL.createObjectURL(file);
      setPreviewPdfUrl(url);
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      setIsScanning(true);
      try {
        const html = await extractDocxContent(file);
        setPreviewHtml(html);
      } catch (_error) {
        setPreviewHtml('<p class="text-red-500">Gagal mengekstrak dokumen.</p>');
      } finally {
        setIsScanning(false);
      }
    } else {
      setPreviewHtml('<p class="text-slate-500">Format file ini belum didukung untuk preview langsung.</p>');
    }
  };

  const handlePreviewSimulation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      Swal.fire({
        title: 'File Belum Dipilih!',
        text: 'Silakan pilih file dokumen terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const file = e.target.files[0];
    const validation = validateSuratFile(file);
    if (!validation.valid) {
      Swal.fire({
        title: validation.title,
        text: validation.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      e.target.value = '';
      return;
    }

    setIsScanning(true);
    setPreviewHtml('');
    try {
      const html = await extractDocxContent(file);
      setPreviewHtml(html);
    } catch (_error) {
      setPreviewHtml('<p class="text-red-500">Gagal mengekstrak dokumen.</p>');
    } finally {
      setIsScanning(false);
    }
  };


  // Ambil hanya data surat yang sesuai dengan "jalur" (Unit Kerja) user approval yang sedang login
  const myUnitData = tugasList.filter((t: any) => t.unitKerja === user?.unitKerja);

  const pendingApprovals = myUnitData.filter(
    t => t.status === 'DRAFT' || t.status === 'VERIFIKASI_SUBBAGIAN' || t.status === 'PERSETUJUAN_PIMPINAN'
  );

  const displayData = pendingApprovals.filter(t => 
    t.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.uraianKegiatan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group data by Month and Year
  const groupedData = displayData.reduce((acc, curr) => {
    const dateObj = new Date(curr.tanggalMulai);
    const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(curr);
    return acc;
  }, {} as Record<string, typeof displayData>);

  const sortedGroups = Object.keys(groupedData).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateA = new Date(parseInt(yearA), months.indexOf(monthA), 1);
    const dateB = new Date(parseInt(yearB), months.indexOf(monthB), 1);
    return dateB.getTime() - dateA.getTime();
  });

  const handleApprove = async (id: string) => {
    try {
      await updateTugasStatus(id, 'SURAT_TERBIT');
    } catch (err) {
      console.error('Gagal menyetujui surat', err);
    }

    // Kirim notifikasi simulasi ke Admin dan Pegawai
    const tugas = tugasList.find((t: any) => t.id === id);
    if (tugas) {
      const existingNotifs = JSON.parse(localStorage.getItem('sim_notifications') || '[]');
      const newNotifAdmin = {
        id: Date.now().toString() + '_admin',
        targetRole: 'admin',
        title: 'Surat Tugas Disetujui',
        message: `Surat ${tugas.nomorSurat} telah disetujui oleh Approver.`,
        time: new Date().toISOString(),
        read: false
      };
      const newNotifsPegawai = tugas.pegawaiDitugaskan.map((peg: any, index: number) => ({
        id: Date.now().toString() + `_user_${peg.id}_${index}`,
        targetUserId: peg.id,
        title: 'Penugasan Baru',
        message: `Anda ditugaskan pada Surat ${tugas.nomorSurat}.`,
        time: new Date().toISOString(),
        read: false
      }));
      localStorage.setItem('sim_notifications', JSON.stringify([newNotifAdmin, ...newNotifsPegawai, ...existingNotifs]));
    }
  };

  const executeWithNotifications = async (tugas: any) => {
    Swal.fire({
      title: 'Memproses Persetujuan...',
      html: 'Mengirim notifikasi via <b>Email</b> dan <b>Telegram</b>...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    handleApprove(tugas.id);

    const msg = `Surat Tugas ${tugas.nomorSurat} telah disetujui.`;
    await sendTelegramNotification(msg);
    await Promise.all(tugas.pegawaiDitugaskan.map((peg: any) => sendEmailNotification(peg.nama, msg)));

    Swal.fire(
      'Berhasil!',
      `Surat disetujui! Notifikasi Email dan Telegram telah berhasil dikirim ke Admin Tugas dan Pegawai (${tugas.pegawaiDitugaskan.length} orang).`,
      'success'
    );
  };

  const handleSubmitUploadModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalTugas) return;

    const validation = validateSuratFile(selectedUploadFile);
    if (!validation.valid || !selectedUploadFile) {
      setUploadErrorMsg(validation.message);
      Swal.fire({
        title: validation.title,
        text: validation.message,
        icon: !selectedUploadFile ? 'warning' : 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    const targetTugas = uploadModalTugas;
    const isApproveMode = uploadAndApproveMode;
    const fileToSave = selectedUploadFile;

    setUploadedFiles(prev => ({ ...prev, [targetTugas.id]: fileToSave }));
    closeUploadModal();

    if (isApproveMode) {
      await executeWithNotifications(targetTugas);
    } else {
      Swal.fire({
        title: 'Berhasil!',
        text: `Dokumen ${fileToSave.name} berhasil diunggah.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleConfirmApprove = (id: string) => {
    const tugas = tugasList.find((t: any) => t.id === id);
    if (!tugas) return;

    Swal.fire({
      title: 'Konfirmasi Persetujuan',
      text: 'Apakah terdapat perubahan pada dokumen surat tugas ini sebelum disetujui?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Ya, Ada Perubahan (Upload)',
      confirmButtonColor: '#3b82f6',
      denyButtonText: 'Tidak, Langsung Setujui',
      denyButtonColor: '#10b981',
      cancelButtonText: 'Batal',
      cancelButtonColor: '#94a3b8',
    }).then((result) => {
      if (result.isConfirmed) {
        openUploadModal(tugas, true);
      } else if (result.isDenied) {
        executeWithNotifications(tugas);
      }
    });
  };

  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Tolak Surat Tugas',
      text: `Anda yakin ingin menolak Surat Tugas ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Tolak'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateTugasStatus(id, 'DITOLAK');
          Swal.fire('Ditolak!', `Surat Tugas ${id} telah ditolak.`, 'error');
        } catch (err) {
          console.error('Gagal menolak surat', err);
          Swal.fire('Error', 'Gagal menolak surat', 'error');
        }
      }
    });
  };

  const handleDownloadWord = async (_id: string, nomorSurat: string) => {
    Swal.fire({
      title: 'Mengunduh Surat Tugas',
      text: `Surat ${nomorSurat} sedang diunduh dalam format Word (.docx)...`,
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(`http://localhost:3000/api/tugas/${_id}/download-word`);
      if (!response.ok) throw new Error('Gagal mengunduh');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_Tugas_${nomorSurat.replace(/\//g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      Swal.fire({
        title: 'Berhasil!',
        text: `Surat ${nomorSurat} berhasil diunggah.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat mengunduh surat. Pastikan backend sudah berjalan.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Persetujuan Surat Tugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau dan proses pengajuan surat tugas dari unit kerja Anda.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full md:w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all shadow-sm"
            placeholder="Cari nomor surat atau perihal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="p-4">Informasi Surat</th>
                <th className="p-4">Pegawai Ditugaskan</th>
                <th className="p-4">Pelaksanaan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedGroups.length > 0 ? (
                sortedGroups.map((groupMonth) => (
                  <React.Fragment key={groupMonth}>
                    <tr className="bg-slate-100/80">
                      <td colSpan={5} className="py-2 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {groupMonth}
                      </td>
                    </tr>
                    {groupedData[groupMonth].map((tugas: any) => (
                      <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                        <td className="p-4 align-top">
                          <div 
                            onClick={() => setSelectedSurat(tugas)}
                            className="flex flex-col gap-1 p-2 -m-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100 group/surat"
                            title="Klik untuk melihat pratinjau surat tugas"
                          >
                            <span className="font-semibold text-slate-800 text-sm group-hover/surat:text-blue-700">{tugas.nomorSurat}</span>
                            <span className="text-slate-600 text-xs line-clamp-2" title={tugas.uraianKegiatan}>
                              {tugas.uraianKegiatan}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                              <FileText className="w-3 h-3 group-hover/surat:text-blue-500" />
                              <span>Oleh: {tugas.pengaju.nama} ({tugas.unitKerja})</span>
                            </div>
                            {uploadedFiles[tugas.id] && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewUploadedFile(uploadedFiles[tugas.id]);
                                }}
                                className="mt-2 flex items-center gap-1.5 p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 w-fit cursor-pointer hover:bg-blue-100 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold truncate max-w-[200px]" title={uploadedFiles[tugas.id].name}>
                                  Attachment: {uploadedFiles[tugas.id].name}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div 
                            onClick={() => setSelectedPegawaiDetail(tugas.pegawaiDitugaskan)}
                            className="flex flex-col gap-2 p-2 -m-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100 group/pegawai"
                            title="Klik untuk melihat detail pegawai"
                          >
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 group-hover/pegawai:text-blue-700">
                              <Users className="w-4 h-4 text-slate-400 group-hover/pegawai:text-blue-500" />
                              <span className="font-medium">{tugas.pegawaiDitugaskan.length} Orang</span>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden">
                              {tugas.pegawaiDitugaskan.slice(0, 3).map((peg: any, idx: number) => (
                                <img
                                  key={idx}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 object-cover"
                                  src={peg.fotoAvatar || `https://ui-avatars.com/api/?name=${peg.nama}&background=random`}
                                  alt={peg.nama}
                                  title={peg.nama}
                                />
                              ))}
                              {tugas.pegawaiDitugaskan.length > 3 && (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-medium text-slate-600">
                                  +{tugas.pegawaiDitugaskan.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-2 text-xs text-slate-600">
                            <div className="flex items-start gap-1.5">
                              <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>
                                {tugas.tanggalMulai} <br />s/d {tugas.tanggalSelesai}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="line-clamp-2">{tugas.tempat}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {tugas.status === 'DRAFT' || tugas.status === 'VERIFIKASI_SUBBAGIAN' || tugas.status === 'PERSETUJUAN_PIMPINAN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200/60">
                              <Clock className="w-3.5 h-3.5" />
                              Perlu Review
                            </span>
                          ) : tugas.status === 'SURAT_TERBIT' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Disetujui
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200/60">
                              <XCircle className="w-3.5 h-3.5" />
                              Ditolak
                            </span>
                          )}
                        </td>
                        <td className="p-4 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDownloadWord(tugas.id, tugas.nomorSurat)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Download format Word"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openUploadModal(tugas, false)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Upload Surat (Sudah TTD / Revisi)"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button
                              onClick={() => handleConfirmApprove(tugas.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors font-medium"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(tugas.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Belum ada surat tugas yang menunggu persetujuan Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload & Validasi Surat Tugas */}
      {uploadModalTugas && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {uploadAndApproveMode ? 'Unggah Revisi & Setujui Surat' : 'Unggah Dokumen Surat Tugas'}
                  </h3>
                  <p className="text-xs text-slate-500">{uploadModalTugas.nomorSurat}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUploadModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUploadModal} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <div className="font-semibold text-slate-700">{uploadModalTugas.uraianKegiatan}</div>
                <div className="text-slate-500">Pengaju: {uploadModalTugas.pengaju?.nama} ({uploadModalTugas.unitKerja})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih File Surat Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={uploadInputRef}
                  type="file"
                  onChange={handleUploadFileSelection}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-1.5 bg-white cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Format yang didukung: <strong>.pdf, .doc, .docx</strong>
                </p>
              </div>

              {selectedUploadFile && !uploadErrorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate font-medium">File siap diunggah: {selectedUploadFile.name}</span>
                </div>
              )}

              {uploadErrorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{uploadErrorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadAndApproveMode ? 'Unggah & Setujui' : 'Unggah Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmApproveId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Konfirmasi Persetujuan
              </h3>
              <button
                onClick={() => setConfirmApproveId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Apakah terdapat perubahan pada dokumen surat tugas ini sebelum disetujui?
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  const target = tugasList.find((t: any) => t.id === confirmApproveId);
                  setConfirmApproveId(null);
                  if (target) {
                    openUploadModal(target, true);
                  }
                }}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Unggah PDF TTD & Setujui
              </button>

              <button
                onClick={() => {
                  handleApprove(confirmApproveId);
                  setConfirmApproveId(null);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui Tanpa PDF (Hanya Demo)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Preview Dokumen Word</h3>
                <p className="text-sm text-slate-500">{previewDocName}</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-100/50">
              {/* Simulator Input untuk Testing Mammoth */}
              <div className="mb-6 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                <label className="block text-sm font-semibold text-blue-800 mb-2">Simulasi File (Upload .docx lokal):</label>
                <input
                  type="file"
                  onChange={handlePreviewSimulation}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
              </div>

              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-blue-600 animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium">Mengekstrak teks dokumen...</p>
                </div>
              ) : previewPdfUrl ? (
                <iframe src={previewPdfUrl} className="w-full h-[60vh] rounded-md border border-slate-200" title="PDF Preview" />
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 min-h-[400px] prose prose-sm max-w-none prose-slate"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                >
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pegawai Detail Modal */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-800">Daftar Pegawai Ditugaskan</h3>
              </div>
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-slate-50 flex-1">
              <div className="space-y-3">
                {selectedPegawaiDetail.map((peg, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                    <img 
                      src={peg.fotoAvatar || `https://ui-avatars.com/api/?name=${peg.nama}&background=random`} 
                      alt={peg.nama} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate" title={peg.nama}>{peg.nama}</div>
                      <div className="text-slate-500 text-[11px] truncate">NIP. {peg.nip}</div>
                      <div className="text-slate-600 text-[11px] mt-1 font-medium truncate" title={peg.jabatan}>{peg.jabatan}</div>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg border border-slate-200 shrink-0">
                      {peg.unitKerja}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Surat Tugas */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Surat Tugas</h3>
                <p className="text-sm text-slate-500">Pratinjau dokumen surat resmi</p>
              </div>
              <button
                onClick={() => setSelectedSurat(null)}
                className="p-2 transition-colors rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 md:p-8">
              {/* Desain Kertas Surat */}
              <div className="max-w-2xl px-8 py-12 mx-auto bg-white border shadow-sm md:px-12 md:py-16 border-slate-200 rounded-xl">
                {/* Kop Surat */}
                <div className="flex flex-col items-center justify-between gap-4 pb-6 mb-6 border-b-4 sm:flex-row border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center shrink-0 w-16 h-20 bg-blue-50 border border-blue-100 rounded-lg shadow-inner sm:w-20 sm:h-24">
                      <img src="/logo-sim.svg" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                      <FileText className="w-10 h-10 text-blue-600 hidden" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg font-bold tracking-wide uppercase sm:text-xl text-slate-800">Pemerintah Kota Pemerintahan</h2>
                      <h3 className="text-base font-semibold tracking-wide uppercase sm:text-lg text-slate-700">Dinas {selectedSurat.unitKerja}</h3>
                      <p className="text-xs text-slate-500 sm:text-sm">Jl. Contoh Alamat No. 123, Kota Pemerintahan, 40123</p>
                    </div>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="mb-8 text-center">
                  <h1 className="text-xl font-bold underline uppercase sm:text-2xl text-slate-800 tracking-tight">Surat Tugas</h1>
                  <p className="mt-1 text-sm font-medium sm:text-base text-slate-600">Nomor: {selectedSurat.nomorSurat}</p>
                </div>

                {/* Isi Surat */}
                <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
                  <p className="text-justify">
                    Berdasarkan pertimbangan dan kebutuhan organisasi, bersama ini kami menugaskan pegawai di bawah ini:
                  </p>

                  <div className="pl-4 border-l-4 border-blue-200 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                      <tbody>
                        {selectedSurat.pegawaiDitugaskan.map((peg: any, index: number) => (
                          <tr key={peg.id} className="border-b last:border-0 border-slate-200">
                            <td className="py-2.5 w-8 align-top font-medium text-slate-600">{index + 1}.</td>
                            <td className="py-2.5">
                              <div className="font-semibold text-slate-800">{peg.nama}</div>
                              <div className="text-slate-500 text-[11px] sm:text-xs">NIP. {peg.nip}</div>
                              <div className="text-slate-600 text-[11px] sm:text-xs mt-0.5">{peg.jabatan}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-justify">
                    Untuk melaksanakan tugas kedinasan dengan rincian sebagai berikut:
                  </p>

                  <table className="w-full text-sm sm:text-base">
                    <tbody>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold w-32 sm:w-40 align-top text-slate-700">Uraian Kegiatan</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-justify font-medium text-slate-800">{selectedSurat.uraianKegiatan}</td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Waktu</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-slate-800">
                          {selectedSurat.tanggalMulai} <span className="text-slate-400 mx-1">s.d.</span> {selectedSurat.tanggalSelesai}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Lokasi</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top">
                          <span className="font-semibold text-slate-800">{selectedSurat.tempat}</span><br/>
                          <span className="text-slate-500 text-sm mt-1 inline-block">{selectedSurat.lokasiSpesifik}</span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Keterangan</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-justify text-slate-800">{selectedSurat.deskripsi}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-justify pt-2">
                    Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab. 
                    Setelah selesai melaksanakan tugas, harap segera membuat laporan hasil pelaksanaan tugas.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="flex justify-end mt-16">
                  <div className="text-center w-56 sm:w-64">
                    <p className="mb-2 text-sm text-slate-600">Ditetapkan di Kota Pemerintahan<br/>Pada tanggal: {selectedSurat.tanggalMulai}</p>
                    <p className="mb-24 font-bold text-slate-800">Kepala Dinas {selectedSurat.unitKerja}</p>
                    
                    <p className="font-bold underline text-slate-800">........................................</p>
                    <p className="text-sm text-slate-600">NIP. ........................................</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end p-4 bg-white border-t border-slate-200 gap-3">
              <button
                onClick={() => handleDownloadWord(selectedSurat.id, selectedSurat.nomorSurat)}
                className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Unduh Dokumen
              </button>
              <button
                onClick={() => setSelectedSurat(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
