import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        unitKerja: true,
        role: true,
      },
      orderBy: { id: 'asc' },
    });

    return users.map(user => ({
      id: user.id.toString(),
      db_id: user.id,
      nama: user.nama,
      nip: user.nip || '-',
      email: user.email,
      unitKerja: user.unitKerja.name,
      role: user.role.name,
      jabatan: user.jabatan || '-',
      golongan: user.golongan || '-',
      pangkat: user.pangkat || '-',
      fotoAvatar: '',
    }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        unitKerja: true,
        role: true,
        suratDitugaskan: {
          include: {
            suratTugas: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      id: user.id.toString(),
      db_id: user.id,
      nama: user.nama,
      nip: user.nip || '-',
      email: user.email,
      unitKerja: user.unitKerja.name,
      role: user.role.name,
      jabatan: user.jabatan || '-',
      golongan: user.golongan || '-',
      pangkat: user.pangkat || '-',
      fotoAvatar: '',
      totalTugas: user.suratDitugaskan.length,
    };
  }

  async create(data: {
    nama: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email: string;
    password: string;
    unit_kerja_id: number;
    role_id: number;
  }) {
    const user = await this.prisma.user.create({ data });
    return { ...user, id: user.id.toString() };
  }

  async update(id: number, data: {
    nama?: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email?: string;
    unit_kerja_id?: number;
    role_id?: number;
  }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return { ...user, id: user.id.toString() };
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { message: `User ${id} deleted successfully` };
  }
}
