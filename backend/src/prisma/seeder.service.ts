import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userCount = await this.prisma.user.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Seed Super Admin
      await this.prisma.user.create({
        data: {
          nama: 'Taryadi, S.Kom.',
          email: 'taryadi@pemda.go.id',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          unitKerja: 'RBI',
        },
      });

      // Seed Admin Terbatas
      await this.prisma.user.create({
        data: {
          nama: 'Admin Tugas',
          email: 'admin.tugas@pemda.go.id',
          password: hashedPassword,
          role: 'ADMIN',
          unitKerja: 'RBI',
        },
      });

      // Seed Pegawai
      await this.prisma.user.create({
        data: {
          nama: 'Arnest, S.Kom.',
          email: 'anggota.demo@pemda.go.id',
          password: hashedPassword,
          role: 'PEGAWAI',
          unitKerja: 'Fastingkom',
        },
      });

      // Seed mock tasks
      await this.prisma.tugas.createMany({
        data: [
          {
            kode: 'ST/084/RBI/VII/2026',
            judul: 'Pendampingan Integrasi Infrastruktur Network & IoT Monitoring Wilayah Utara',
            penerima: 'Arnest, S.Kom.',
            status: 'BERJALAN',
          },
          {
            kode: 'ST/112/DINKES/VII/2026',
            judul: 'Supervisi Operasi Posko Kesehatan & Imunisasi Anak Serentak',
            penerima: 'Admin Tugas',
            status: 'BERJALAN',
          },
        ],
      });

      console.log('Database seeded successfully!');
    }
  }
}
