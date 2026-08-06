import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('tugas')
export class TugasController {
  private readonly tugas = [
    {
      id: 'st-001', nomorSurat: 'ST/084/RBI/VII/2026',
      perihal: 'Pendampingan Integrasi Infrastruktur Network & IoT Monitoring Wilayah Utara',
      unitKerja: 'RBI', tanggalMulai: '2026-07-28', tanggalSelesai: '2026-07-30',
      lokasiPenugasan: 'Kecamatan Lembang, Bandung Barat', koordinat: [-6.8167, 107.6167],
      deskripsi: 'Pendampingan integrasi infrastruktur monitoring.', status: 'SURAT_TERBIT',
      pengaju: { id: 'peg-01', nama: 'Taryadi, S.Kom.', nip: '2350081041', unitKerja: 'RBI', jabatan: 'Analisis Sistem Informasi Utama' },
      pegawaiDitugaskan: [{ id: 'peg-01', nama: 'Taryadi, S.Kom.', nip: '2350081041', unitKerja: 'RBI', jabatan: 'Analisis Sistem Informasi Utama' }],
      workflow: [{ stage: 'SURAT_TERBIT', label: 'Penerbitan Surat Tugas Resmi', actor: 'Tata Usaha', status: 'COMPLETED' }],
    },
  ];

  @Get()
  getTugas() {
    return this.tugas;
  }

  @Post()
  createTugas(@Body() body: Record<string, unknown>) {
    const tugas = { ...body, id: `st-${String(this.tugas.length + 1).padStart(3, '0')}` };
    this.tugas.unshift(tugas as (typeof this.tugas)[number]);
    return tugas;
  }
}
