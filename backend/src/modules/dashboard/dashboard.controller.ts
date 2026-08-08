import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get()
  getDashboard() {
    return {
      welcome: {
        unitKerja: 'RBI',
        role: 'ADMIN',
        nama: 'Taryadi, S.Kom.',
      },
      stats: {
        activeAssignments: 3,
        attendanceToday: 95.45,
        draftApproval: 2,
        estimatedTukin: 7312500,
      },
      recentAssignments: [
        {
          id: 'st-001',
          nomorSurat: 'ST/084/RBI/VII/2026',
          perihal:
            'Pendampingan Integrasi Infrastruktur Network & IoT Monitoring Wilayah Utara',
          unitKerja: 'RBI',
          lokasiPenugasan: 'Kecamatan Lembang, Bandung Barat',
          status: 'SURAT_TERBIT',
        },
      ],
      recentAttendance: [
        {
          id: 'att-001',
          nama: 'Taryadi, S.Kom.',
          nip: '2350081041',
          unitKerja: 'RBI',
          jamMasuk: '07:28',
          lokasiPresensiMasuk: 'Pos Pantau Lembang',
        },
      ],
    };
  }
}
