import { Controller, Get } from '@nestjs/common';

@Controller('absensi')
export class AbsensiController {
  @Get()
  getAbsensi() {
    return {
      pribadi: {
        totalHadir: 20,
        totalTerlambat: 1,
        totalIzin: 1,
        persentaseKehadiran: 95.45,
        tukin: {
          periodeBulan: 'Juli 2026',
          tunjanganDasar: 7500000,
          totalPotonganPersen: 2.5,
          totalPotonganNominal: 187500,
          tunjanganDiterima: 7312500,
        },
      },
      pegawaiLain: [
        {
          id: 'pres-001',
          nama: 'Dr. Ahmad Fauzi, M.Kes.',
          nip: '198503122010011002',
          unitKerja: 'Dinas Kesehatan',
          jamMasuk: '07:20',
          lokasiPresensiMasuk: 'Puskesmas Pembantu Cimahi Tengah',
          status: 'HADIR',
        },
      ],
    };
  }
}
