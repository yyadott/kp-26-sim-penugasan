import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Absensi } from '@prisma/client';

@Controller('absensi')
export class AbsensiController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAbsensi() {
    const list = await this.prisma.absensi.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalHadir = list.filter((a: Absensi) => a.status === 'HADIR').length;
    const totalTerlambat = list.filter((a: Absensi) => a.status === 'TERLAMBAT').length;
    const totalIzin = list.filter((a: Absensi) => a.status === 'IZIN').length;

    return {
      pribadi: {
        totalHadir: totalHadir || 20,
        totalTerlambat: totalTerlambat || 1,
        totalIzin: totalIzin || 1,
        persentaseKehadiran: 95.45,
        tukin: {
          periodeBulan: 'Juli 2026',
          tunjanganDasar: 7500000,
          totalPotonganPersen: 2.5,
          totalPotonganNominal: 187500,
          tunjanganDiterima: 7312500,
        },
      },
      pegawaiLain: list.map((a: Absensi) => ({
        id: a.id,
        nama: 'Pegawai Lapangan',
        nip: a.anggotaId,
        unitKerja: 'RBI',
        jamMasuk: a.jamMasuk,
        lokasiPresensiMasuk: a.lokasiPresensiMasuk,
        status: a.status,
      })),
    };
  }

  @Post()
  async submitAbsensi(@Body() body: any) {
    const abs = await this.prisma.absensi.create({
      data: {
        anggotaId: body.anggotaId || 'peg-07',
        tanggal: body.tanggal || new Date().toISOString().split('T')[0],
        jamMasuk: body.jamMasuk || '07:30',
        lokasiPresensiMasuk: body.lokasiPresensiMasuk || 'Kantor Pusat',
        status: body.status || 'HADIR',
        keterangan: body.keterangan || null,
      },
    });

    return {
      message: 'Presensi berhasil direkam',
      data: abs,
    };
  }
}
