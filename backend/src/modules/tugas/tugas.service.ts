import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';

@Injectable()
export class TugasService {
  constructor(private prisma: PrismaService) {}

  private mapToDto(item: any) {
    return {
      id: item.id,
      nomorSurat: item.nomorSurat,
      uraianKegiatan: item.uraianKegiatan,
      pengaju: {
        id: item.pengaju.id.toString(),
        nama: item.pengaju.nama,
        email: item.pengaju.email,
      },
      pegawaiDitugaskan: item.pegawaiDitugaskan.map((p: any) => ({
        id: p.user.id.toString(),
        nama: p.user.nama,
        email: p.user.email,
      })),
      unitKerja: item.unitKerja,
      tanggalMulai: item.tanggalMulai,
      tanggalSelesai: item.tanggalSelesai,
      tempat: item.tempat,
      koordinatLat: item.koordinatLat,
      koordinatLng: item.koordinatLng,
      koordinat: [item.koordinatLat, item.koordinatLng],
      deskripsi: item.deskripsi,
      status: item.status,
      linkSurat: item.linkSurat,
      biaya: item.biaya,
      workflow: [],
    };
  }

  async findAll() {
    const data = await this.prisma.suratTugas.findMany({
      include: {
        pengaju: true,
        pegawaiDitugaskan: {
          include: {
            user: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return data.map(item => this.mapToDto(item));
  }

  async findOne(id: string) {
    const item = await this.prisma.suratTugas.findUnique({
      where: { id },
      include: {
        pengaju: true,
        pegawaiDitugaskan: { include: { user: true } }
      }
    });
    if (!item) return null;
    return this.mapToDto(item);
  }

  async create(data: any) {
    const { pegawaiDitugaskan, pengaju_id, ...rest } = data;
    return this.prisma.suratTugas.create({
      data: {
        ...rest,
        pengaju: { connect: { id: parseInt(pengaju_id, 10) } },
        pegawaiDitugaskan: {
          create: (pegawaiDitugaskan || []).map((userId: string) => ({
            user: { connect: { id: parseInt(userId, 10) } }
          }))
        }
      },
      include: {
        pengaju: true,
        pegawaiDitugaskan: { include: { user: true } }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.suratTugas.update({
      where: { id },
      data
    });
  }
}
