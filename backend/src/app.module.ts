import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { TugasController } from './modules/tugas/tugas.controller';
import { AbsensiController } from './modules/absensi/absensi.controller';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    DashboardController,
    TugasController,
    AbsensiController,
    AuthController,
  ],
  providers: [AppService, AuthService],
})
export class AppModule {}
