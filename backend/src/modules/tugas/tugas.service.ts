import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TugasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.suratTugas.findMany({
      include: {
        pengaju: true,
        pegawaiDitugaskan: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.suratTugas.findUnique({
      where: { id },
      include: {
        pengaju: true,
        pegawaiDitugaskan: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.SuratTugasCreateInput) {
    return this.prisma.suratTugas.create({
      data,
    });
  }

  async update(id: string, data: Prisma.SuratTugasUpdateInput) {
    return this.prisma.suratTugas.update({
      where: { id },
      data,
    });
  }
}
