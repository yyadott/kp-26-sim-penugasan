import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve('c:/Users/myLenovo/OneDrive/Documents/2350081041_TARYADI_KP_GANJIL_S6/SIMPenugasan/Contoh_Data/Rekap Penugasan Pegawai 2026.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetsToProcess = ['JANUARI', 'FEBRUARI'];

  for (const sheetName of sheetsToProcess) {
    console.log(`Processing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.log(`Sheet ${sheetName} not found.`);
      continue;
    }

    const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    
    // Find where the actual data starts (look for first row with a number in NO column, which is index 1)
    let startIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][1] && !isNaN(parseInt(data[i][1]))) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      console.log(`Could not find data rows in sheet ${sheetName}`);
      continue;
    }

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // Skip empty rows

      const no = row[1];
      const nama = row[2] || '';
      const nomorSurat = row[3] || '-';
      const uraianKegiatan = row[4] || '-';
      const tanggalMulai = row[5] || '';
      const tanggalSelesai = row[6] || '';
      const tempat = row[7] || '-';
      const biaya = row[8] || '';
      const pembuatST = row[9] || '';
      const linkSurat = row[10] || '';

      // Skip rows with no nama or uraian
      if (!nama || !uraianKegiatan || uraianKegiatan === '-') continue;

      // Find or create admin role
      let adminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
      if (!adminRole) {
        adminRole = await prisma.role.create({ data: { name: 'Super Admin' } });
      }

      // Find or create default department
      let defaultDept = await prisma.unitKerja.findFirst({ where: { name: 'Umum' } });
      if (!defaultDept) {
        defaultDept = await prisma.unitKerja.create({ data: { name: 'Umum' } });
      }

      // Find or create admin user
      let defaultUser = await prisma.user.findFirst({
        where: { role_id: adminRole.id }
      });

      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            nama: 'Admin Sistem',
            email: 'admin@example.com',
            password: 'password',
            role_id: adminRole.id,
            unit_kerja_id: defaultDept.id,
          }
        });
      }

      // Try to find users based on nama column. 
      const namaList = nama.split(/\d+\.\s*/).filter((n: string) => n.trim().length > 0).map((n: string) => n.trim().replace(/\r?\n/g, ''));
      
      const pegawaiDitugaskan = [];
      let pegawaiRole = await prisma.role.findFirst({ where: { name: 'Pegawai' } });
      if (!pegawaiRole) {
        pegawaiRole = await prisma.role.create({ data: { name: 'Pegawai' } });
      }

      for (const n of namaList) {
        let user = await prisma.user.findFirst({
          where: { nama: { contains: n.split(',')[0] } } 
        });
        
        if (!user) {
          const username = n.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10) + Math.floor(Math.random() * 1000);
          user = await prisma.user.create({
            data: {
              nama: n,
              email: `${username}@example.com`,
              password: 'password',
              role_id: pegawaiRole.id,
              unit_kerja_id: defaultDept.id
            }
          });
        }
        pegawaiDitugaskan.push(user.id);
      }

      // Create SuratTugas
      await prisma.suratTugas.create({
        data: {
          nomorSurat,
          uraianKegiatan,
          tanggalMulai,
          tanggalSelesai,
          tempat,
          biaya,
          linkSurat,
          deskripsi: uraianKegiatan,
          unitKerja: 'UMUM',
          status: 'SURAT_TERBIT',
          pengaju: { connect: { id: defaultUser.id } },
          pegawaiDitugaskan: {
            create: pegawaiDitugaskan.map((userId) => ({
              user: { connect: { id: userId } }
            }))
          }
        }
      });
      console.log(`Imported No: ${no}, Surat: ${nomorSurat}`);
    }
  }
  console.log('Import completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
