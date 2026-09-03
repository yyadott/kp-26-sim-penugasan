const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.suratTugasPegawai.deleteMany({});
  await prisma.suratTugas.deleteMany({});
  console.log('Tasks cleared!');
}
main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
