import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('tugas')
export class TugasController {
  @Get()
  getTugas() {
    return [
      {
        id: 'st-001',
        nomorSurat: 'ST/084/RBI/VII/2026',
        perihal: 'Pendampingan Integrasi Infrastruktur Network & IoT Monitoring Wilayah Utara',
        unitKerja: 'RBI',
        status: 'SURAT_TERBIT',
        lokasiPenugasan: 'Kecamatan Lembang, Bandung Barat',
        pengaju: { nama: 'Taryadi, S.Kom.' },
        pegawaiDitugaskan: [{ nama: 'Taryadi, S.Kom.' }],
      },
      {
        id: 'st-002',
        nomorSurat: 'ST/112/DINKES/VII/2026',
        perihal: 'Supervisi Operasi Posko Kesehatan & Imunisasi Anak Serentak',
        unitKerja: 'Dinas Kesehatan',
        status: 'SURAT_TERBIT',
        lokasiPenugasan: 'Puskesmas Pembantu Cimahi Tengah',
        pengaju: { nama: 'Dr. Ahmad Fauzi, M.Kes.' },
        pegawaiDitugaskan: [{ nama: 'Dr. Ahmad Fauzi, M.Kes.' }],
      },
    ];
  }

  @Post()
  createTugas(@Body() body: any) {
    return {
      message: 'Draft tugas berhasil dibuat',
      data: body,
    };
  }
}
