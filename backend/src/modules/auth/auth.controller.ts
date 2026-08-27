import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: { email: string; password?: string; nip?: string }) {
    // Determine search criteria based on body (can be email or nip)
    const searchParam = body.email || body.nip || '';
    
    // Find user by email or NIP (Assuming email stores something identifiable or we have NIP in future)
    // For now we check email
    const user = await this.prisma.user.findFirst({
      where: {
        email: { contains: searchParam }
      },
      include: {
        role: true,
        departemen: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // In a real app we'd verify passwords with bcrypt. For this prototype, we bypass it.
    
    return {
      message: 'Login berhasil',
      token: 'dummy-jwt-token',
      user: {
        id: `peg-${user.id < 10 ? '0' + user.id : user.id}`,
        nama: user.nama,
        email: user.email,
        role: user.role.name,
        unitKerja: user.departemen.name,
      },
    };
  }
}
