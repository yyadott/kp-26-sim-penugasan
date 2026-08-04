import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { TugasController } from './modules/tugas/tugas.controller';
import { AbsensiController } from './modules/absensi/absensi.controller';
import { AuthController } from './modules/auth/auth.controller';

@Module({
  imports: [],
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
