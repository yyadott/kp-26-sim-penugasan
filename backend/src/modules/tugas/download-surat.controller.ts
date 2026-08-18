import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DownloadSuratService } from './download-surat.service';

@Controller('tugas')
export class DownloadSuratController {
  constructor(private readonly downloadSuratService: DownloadSuratService) {}

  @Get(':id/download-word')
  async downloadWord(@Param('id') id: string, @Res() res: Response) {
    const surat = this.downloadSuratService.findSuratById(id);
    if (!surat) {
      return res.status(404).json({ message: 'Surat tidak ditemukan' });
    }

    const buffer = await this.downloadSuratService.generateWord(id);
    const filename = `Surat_Tugas_${surat.nomorSurat.replace(/\//g, '-')}.docx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
