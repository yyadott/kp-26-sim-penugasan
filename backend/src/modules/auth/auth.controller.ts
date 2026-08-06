import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { username?: string; email?: string; password?: string }) {
    const username = (body.username || body.email || '').trim().toLowerCase();
    const users = [
      {
        id: 'peg-01', nama: 'Taryadi, S.Kom.', nip: '2350081041', unitKerja: 'RBI',
        jabatan: 'Analisis Sistem Informasi Utama', email: 'taryadi@pemda.go.id', role: 'ADMIN',
      },
      {
        id: 'peg-02', nama: 'Yudi', nip: '198503122010011002', unitKerja: 'Fastingkom',
        jabatan: 'Front Office', email: 'yudi@ulp.go.id', role: 'PEGAWAI',
      },
    ];
    const user = users.find((item) =>
      [item.nip, item.email, item.email.split('@')[0], item.nama.toLowerCase()].includes(username),
    );

    if (!user || body.password !== 'password123') {
      throw new UnauthorizedException('Username/NIP atau password tidak valid.');
    }

    return {
      message: 'Login berhasil',
      token: `demo-token-${user.id}`,
      user,
    };
  }
}
