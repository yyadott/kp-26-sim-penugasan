import { Controller, Get, Param } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geoService: GeolocationService) {}

  @Get(':ip')
  async getLocation(@Param('ip') ip: string) {
    return this.geoService.getIpLocation(ip);
  }
}
