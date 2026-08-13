import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tugas } from '@prisma/client';

@Controller('tugas')
export class TugasController {
  constructor(private prisma: PrismaService) { }

  @Get()
  HEAD
  getTugas() {
    return [
      {
        id: 'st-001',
        nomorSurat: 'ST/084/RBI/VII/2026',
        perihal: 'Pendampingan Integrasi Infrastruktur Network & IoT Monitoring Wilayah Utara',
        unitKerja: 'RBI',
        status: 'SURAT_TERBIT',
        lokasiPenugasan: 'Kecamatan Lembang, Bandung Barat',
        pengaju: { nama: 'Taryadi' },
        pegawaiDitugaskan: [{ nama: 'Taryadi' }],
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
  async getTugas() {
      const list = await this.prisma.tugas.findMany({
        orderBy: { dibuatPada: 'desc' },
      });

      // Map model fields to support both client structures
      return list.map((task: Tugas) => ({
        id: task.id,
        kode: task.kode,
        nomorSurat: task.kode, // Aliasing for legacy compatibility
        perihal: task.judul,   // Aliasing for legacy compatibility
        judul: task.judul,
        penerima: task.penerima,
        status: task.status,
        deadline: task.deadline,
        pengaju: { nama: 'Administrator' },
        pegawaiDitugaskan: [{ nama: task.penerima }],
      }));
      8653eb3(push update admin)
    }

    @Post()
    async createTugas(@Body() body: any) {
      const { kode, judul, penerima, deadline } = body;
      const task = await this.prisma.tugas.create({
        data: {
          kode: kode || `ST-${Date.now().toString().slice(-4)}`,
          judul: judul || body.perihal || 'Penugasan Baru',
          penerima: penerima || 'Semua Pegawai',
          deadline: deadline || null,
          status: 'BERJALAN',
        },
      });

      return {
        message: 'Draft tugas berhasil dibuat',
        data: task,
      };
    }

    @Put(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
      const updated = await this.prisma.tugas.update({
        where: { id },
        data: { status: body.status },
      });

      return {
        message: 'Status tugas berhasil diperbarui',
        data: updated,
      };
    }
  }
