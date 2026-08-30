import { Module } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';

import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService, PrismaService],
})
export class UnitKerjaModule {}
