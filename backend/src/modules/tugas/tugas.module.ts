import { Module } from '@nestjs/common';
import { TugasController } from './tugas.controller';
import { TugasService } from './tugas.service';
import { DownloadSuratController } from './download-surat.controller';
import { DownloadSuratService } from './download-surat.service';

@Module({
  controllers: [TugasController, DownloadSuratController],
  providers: [TugasService, DownloadSuratService],
})
export class TugasModule {}
