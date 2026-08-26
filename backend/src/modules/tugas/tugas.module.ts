import { Module } from '@nestjs/common';
import { TugasController } from './tugas.controller';
import { TugasService } from './tugas.service';
import { DownloadSuratController } from './download-surat.controller';
import { DownloadSuratService } from './download-surat.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TugasController, DownloadSuratController],
  providers: [TugasService, DownloadSuratService, PrismaService],
})
export class TugasModule {}
