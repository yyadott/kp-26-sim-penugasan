import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { TugasController } from './modules/tugas/tugas.controller';
import { AbsensiController } from './modules/absensi/absensi.controller';
import { AuthController } from './modules/auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AppController,
    DashboardController,
    TugasController,
    AbsensiController,
    AuthController,
  ],
  providers: [AppService],
})
export class AppModule {}
