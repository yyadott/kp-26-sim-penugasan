const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDB() {
  const tugasList = await prisma.suratTugas.findMany();
  const units = ['Kepeg', 'Fastingkom', 'PM'];
  
  let i = 0;
  for (const tugas of tugasList) {
    await prisma.suratTugas.update({
      where: { id: tugas.id },
      data: { unitKerja: units[i % 3] }
    });
    i++;
  }
  
  console.log(`Updated ${tugasList.length} SuratTugas records with randomized units.`);
  
  // Clean up 'Umum' if it exists
  await prisma.departemen.deleteMany({
    where: { name: 'Umum' }
  });
}

updateDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
