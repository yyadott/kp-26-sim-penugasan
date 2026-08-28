const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDB() {
  const tugasCount = await prisma.suratTugas.updateMany({
    where: { unitKerja: 'RBI' },
    data: { unitKerja: 'Kepeg' }
  });
  console.log('Updated SuratTugas records:', tugasCount.count);
  
  // also check Departemen
  const deptCount = await prisma.departemen.updateMany({
    where: { name: 'RBI' },
    data: { name: 'Kepeg' }
  });
  console.log('Updated Departemen records:', deptCount.count);
}

updateDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
