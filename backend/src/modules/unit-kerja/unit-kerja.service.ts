import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UnitKerjaService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.unitKerja.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
