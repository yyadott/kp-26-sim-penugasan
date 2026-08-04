import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return {
      message: 'Login berhasil',
      token: 'dummy-jwt-token',
      user: {
        id: 'peg-01',
        nama: 'Taryadi, S.Kom.',
        email: body.email,
        role: 'ADMIN',
        unitKerja: 'RBI',
      },
    };
  }
}
