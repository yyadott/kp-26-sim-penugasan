import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tugas } from '@prisma/client';

@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getDashboard() {
    const activeAssignments = await this.prisma.tugas.count({
      where: { status: 'BERJALAN' },
    });

    const recentTasks = await this.prisma.tugas.findMany({
      take: 5,
      orderBy: { dibuatPada: 'desc' },
    });

    return {
      welcome: {
        unitKerja: 'RBI',
        role: 'ADMIN',
        nama: 'Taryadi',
      },
      stats: {
        activeAssignments,
        attendanceToday: 95.45,
        draftApproval: 2,
        estimatedTukin: 7312500,
      },
      recentAssignments: recentTasks.map((t: Tugas) => ({
        id: t.id,
        nomorSurat: t.kode,
        perihal: t.judul,
        unitKerja: 'RBI',
        lokasiPenugasan: 'Bandung',
        status: t.status === 'BERJALAN' ? 'SURAT_TERBIT' : 'SELESAI',
      })),
      recentAttendance: [
        {
          id: 'att-001',
          nama: 'Taryadi',
          nip: '2350081041',
          unitKerja: 'RBI',
          jamMasuk: '07:28',
          lokasiPresensiMasuk: 'Pos Pantau Lembang',
        },
      ],
    };
  }
}
