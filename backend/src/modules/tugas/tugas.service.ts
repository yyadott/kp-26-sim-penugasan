import { Injectable } from '@nestjs/common';

// Stub service - tidak menggunakan database langsung.
// Koneksi database akan diintegrasikan setelah setup Prisma selesai.
@Injectable()
export class TugasService {
  findAll() {
    return { message: 'Endpoint ini memerlukan koneksi database.' };
  }

  findOne(id: string) {
    return { message: `Data surat ${id} memerlukan koneksi database.` };
  }

  create(data: any) {
    return { message: 'Create memerlukan koneksi database.', data };
  }

  update(id: string, data: any) {
    return { message: `Update ${id} memerlukan koneksi database.`, data };
  }
}
