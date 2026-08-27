import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        departemen: true,
        role: true,
      }
    });

    return users.map(user => ({
      id: user.id.toString(),
      db_id: user.id, // Keep numeric ID for internal references
      nama: user.nama,
      email: user.email,
      unitKerja: user.departemen.name,
      role: user.role.name,
      // Default fallback if we don't have these in DB
      jabatan: user.role.name === 'SUPER_ADMIN' ? 'Super Admin' : 'Anggota',
      fotoAvatar: '',
    }));
  }
}
