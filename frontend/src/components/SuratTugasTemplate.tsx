import React from 'react';
import type { AjuanSuratTugas } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  ajuan: AjuanSuratTugas;
}

const SuratTugasTemplate: React.FC<Props> = ({ ajuan }) => {
  const formatDateFull = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  const tanggalPenugasan = ajuan.tanggalSelesai || ajuan.tanggalMulai;
  const lokasiText = [ajuan.lokasiSpesifik, ajuan.tempat].filter(Boolean).join('. ');

  return (
    <div className="bg-slate-100 p-4 sm:p-8 rounded-b-2xl w-full flex justify-center">
      {/* Kertas A4 Container */}
      <div className="bg-white shadow-xl max-w-[210mm] w-full min-h-[297mm] px-10 py-12 sm:px-[15mm] sm:py-[20mm]">
        
        {/* KOP SURAT */}
        <div className="pb-4 mb-8">
          <img 
            src={`${import.meta.env.BASE_URL}kop-surat-baru.png`} 
            alt="Kop Surat Kemendikdasmen" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* JUDUL SURAT */}
        <div className="text-center mb-8 font-serif text-slate-900">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-1">SURAT TUGAS</h2>
          <p className="text-[15px]">Nomor&nbsp;&nbsp;&nbsp;: {ajuan.nomorSurat}</p>
        </div>

        {/* ISI SURAT */}
        <div className="font-serif text-[15px] leading-relaxed text-slate-900 space-y-6">
          <p className="text-justify">
            Kepala Balai Besar Pengembangan Penjaminan Mutu Pendidikan Vokasi Bidang Mesin dan Teknik Industri (BBPPMPV BMTI) menugasi
          </p>

          <div className="ml-4 space-y-4">
            {ajuan.pegawaiDitugaskan.map((pegawai, index) => (
              <div key={pegawai.id} className={`${index > 0 ? 'mt-6 pt-6 border-t border-slate-200 border-dashed' : ''}`}>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-48 align-top">nama</td>
                      <td className="w-4 align-top">:</td>
                      <td className="font-bold">{pegawai.nama}</td>
                    </tr>
                    <tr>
                      <td className="align-top">NIP</td>
                      <td className="align-top">:</td>
                      <td>{pegawai.nip}</td>
                    </tr>
                    <tr>
                      <td className="align-top">pangkat dan golongan</td>
                      <td className="align-top">:</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td className="align-top">jabatan</td>
                      <td className="align-top">:</td>
                      <td>{pegawai.jabatan}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <p className="text-justify mt-6">
            sebagai {ajuan.deskripsi || ajuan.uraianKegiatan}. Kegiatan akan diselenggarakan pada tanggal {formatDateFull(tanggalPenugasan)} di {lokasiText}.
          </p>

          <p className="text-justify">
            Seluruh biaya perjalanan dinas yang berkaitan dengan kegiatan tersebut dibebankan pada pihak penyelenggara sesuai dengan ketentuan yang berlaku.
          </p>

          <p className="text-justify">
            Surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab dan yang bersangkutan diharapkan membuat laporan.
          </p>
        </div>

        {/* TANDA TANGAN */}
        <div className="mt-16 flex justify-end font-serif text-[15px] text-slate-900">
          <div className="w-64 text-center">
            <p className="mb-20">Kepala,</p>
            <p className="font-bold">Baharudin</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SuratTugasTemplate;
