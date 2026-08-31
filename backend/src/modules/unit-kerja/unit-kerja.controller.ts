import { Controller, Get } from '@nestjs/common';
import { UnitKerjaService } from './unit-kerja.service';

@Controller('unit-kerja')
export class UnitKerjaController {
  constructor(private readonly unitKerjaService: UnitKerjaService) {}

  @Get()
  findAll() {
    return this.unitKerjaService.findAll();
  }
}
