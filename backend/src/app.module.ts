import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { AbsensiController } from './modules/absensi/absensi.controller';
import { AuthController } from './modules/auth/auth.controller';
import { TugasModule } from './modules/tugas/tugas.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { UnitKerjaModule } from './modules/unit-kerja/unit-kerja.module';

@Module({
  imports: [
    TugasModule,
    GeolocationModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // 1 hour in ms
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        genReqId: (req) => {
          // Generate a trace id (pres id) for each request
          return req.headers['x-request-id'] || uuidv4();
        },
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
      },
    }),
    UsersModule,
    RolesModule,
    UnitKerjaModule,
  ],
  controllers: [
    AppController,
    DashboardController,
    AbsensiController,
    AuthController,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
