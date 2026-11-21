import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string; nip?: string }) {
    const searchParam = (body.email || body.nip || '').trim().toLowerCase();
    const password = body.password || '';

    if (!searchParam || !password) {
      throw new UnauthorizedException('Username/NIP dan Password wajib diisi!');
    }

    // Cari pengguna secara spesifik berdasarkan Email lengkap, NIP, atau prefix Email sebelum '@'
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: searchParam },
          { nip: searchParam },
          { email: { startsWith: `${searchParam}@` } },
        ],
      },
      include: {
        role: true,
        unitKerja: true,
      },
    });

    // Validasi kecocokan akun dan password
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Username/NIP atau Password yang Anda masukkan salah!');
    }

    // Validasi apakah akun aktif
    if (user.is_active === false) {
      throw new UnauthorizedException('Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.');
    }

    return {
      message: 'Login berhasil',
      token: 'dummy-jwt-token',
      user: {
        db_id: user.id,
        id: `peg-${user.id < 10 ? '0' + user.id : user.id}`,
        nama: user.nama,
        nip: user.nip || '-',
        jabatan: user.jabatan || '-',
        golongan: user.golongan || '-',
        pangkat: user.pangkat || '-',
        email: user.email,
        role: user.role.name,
        unitKerja: user.unitKerja.name,
      },
    };
  }
}
