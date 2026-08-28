const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const filePath = path.resolve('c:/Users/myLenovo/OneDrive/Documents/2350081041_TARYADI_KP_GANJIL_S6/SIMPenugasan/Contoh_Data/Rekap Penugasan Pegawai 2026.xlsx');
  console.log(`Reading ${filePath}...`);
  const workbook = XLSX.readFile(filePath);
  const sheetsToProcess = ['JANUARI', 'FEBRUARI'];

  let updatedCount = 0;
  let adminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
  let deptKepeg = await prisma.departemen.findFirst({ where: { name: 'Kepeg' } });

  for (const sheetName of sheetsToProcess) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    let startIndex = -1;
    for (let i = 0; i < Math.min(data.length, 20); i++) {
      const row = data[i];
      if (row[1] && row[1].toString().toLowerCase() === 'no' && row[2] && row[2].toString().toLowerCase().includes('nama')) {
        startIndex = i + 1;
        break;
      }
    }

    if (startIndex === -1) continue;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue;

      const uraianKegiatan = row[4] ? row[4].trim() : '';
      const pembuatST = row[9] ? row[9].trim() : '';

      if (!uraianKegiatan || uraianKegiatan === '-' || !pembuatST) continue;

      // Find or create user for this pembuatST
      let pengaju = await prisma.user.findFirst({
        where: { nama: pembuatST }
      });

      if (!pengaju) {
        pengaju = await prisma.user.create({
          data: {
            nama: pembuatST,
            email: `${pembuatST.toLowerCase().replace(/[^a-z0-9]/g, '')}@pemda.go.id`,
            password: 'password',
            role_id: adminRole.id, // Give them Admin role for now, or PEGAWAI
            departemen_id: deptKepeg.id,
          }
        });
        console.log(`Created new User for Pengaju: ${pembuatST}`);
      }

      // Update SuratTugas that matches the Uraian Kegiatan
      // Using uraianKegiatan as a unique identifier for the task, since it's typically long
      const result = await prisma.suratTugas.updateMany({
        where: { 
          uraianKegiatan: {
            equals: uraianKegiatan
          }
        },
        data: {
          pengaju_id: pengaju.id
        }
      });
      
      updatedCount += result.count;
    }
  }
  
  console.log(`Updated ${updatedCount} SuratTugas records with correct Pengaju from Excel.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
