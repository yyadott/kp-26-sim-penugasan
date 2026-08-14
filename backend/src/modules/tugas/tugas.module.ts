import { Module } from '@nestjs/common';
import { TugasController } from './tugas.controller';
import { TugasService } from './tugas.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TugasController],
  providers: [TugasService, PrismaService],
})
export class TugasModule {}
