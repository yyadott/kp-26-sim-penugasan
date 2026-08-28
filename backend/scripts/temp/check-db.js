const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.suratTugasPegawai.count();
  console.log('SuratTugasPegawai count:', count);
  const userCount = await prisma.user.count();
  console.log('User count:', userCount);
}
main().finally(() => prisma.$disconnect());
