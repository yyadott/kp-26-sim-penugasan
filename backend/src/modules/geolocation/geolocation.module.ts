import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeolocationService } from './geolocation.service';
import { GeolocationController } from './geolocation.controller';

@Module({
  imports: [HttpModule],
  providers: [GeolocationService],
  controllers: [GeolocationController],
  exports: [GeolocationService]
})
export class GeolocationModule {}
