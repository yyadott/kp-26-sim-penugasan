import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class GeolocationService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    @InjectPinoLogger(GeolocationService.name) private readonly logger: PinoLogger,
  ) {}

  async getIpLocation(ip: string): Promise<any> {
    const cacheKey = `geo_ip_${ip}`;
    
    // Check if the IP data is already in cache
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      this.logger.info(`Memuat data IP ${ip} dari cache (Hit)`);
      return cachedData;
    }

    this.logger.info(`Cache miss. Menembak IP ${ip} ke layanan eksternal.`);
    try {
      // Example external API call (ip-api.com)
      const response = await lastValueFrom(this.httpService.get(`http://ip-api.com/json/${ip}`));
      const data = response.data;
      
      // Save to in-memory cache for 1 hour (3600000 ms)
      await this.cacheManager.set(cacheKey, data, 3600000);
      
      return data;
    } catch (error: any) {
      this.logger.error(`Gagal mendapatkan lokasi untuk IP ${ip}: ${error.message}`);
      throw error;
    }
  }
}
