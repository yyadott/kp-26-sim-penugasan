import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Email dan password wajib diisi');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Kredensial tidak sesuai atau user tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial tidak sesuai');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil',
      token,
      user: {
        HEAD
        id: 'peg-01',
        nama: 'Taryadi',
        email: body.email,
        role: 'ADMIN',
        unitKerja: 'RBI',
        id: user.id.toString(),
        nama: user.nama,
        email: user.email,
        role: user.role,
        unitKerja: user.unitKerja,
        8653eb3(push update admin)
      },
    };
  }
}
