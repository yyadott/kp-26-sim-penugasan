import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roleAdmin = await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
  const rolePegawai = await prisma.role.create({ data: { name: 'PEGAWAI' } });
  const roleTugas = await prisma.role.create({ data: { name: 'ADMIN' } });

  // Departemen (Unit Kerja)
  const deptKepeg = await prisma.unitKerja.create({ data: { name: 'Kepeg' } });
  const deptFastingkom = await prisma.unitKerja.create({ data: { name: 'Fastingkom' } });
  const deptPM = await prisma.unitKerja.create({ data: { name: 'PM' } });

  // Users (Pegawai)
  await prisma.user.create({
    data: { id: 1, nama: 'Taryadi', email: 'taryadi@pemda.go.id', password: 'password', unit_kerja_id: deptKepeg.id, role_id: roleAdmin.id }
  });
  await prisma.user.create({
    data: { id: 2, nama: 'Yudi', email: 'yudi@ulp.go.id', password: 'password', unit_kerja_id: deptFastingkom.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 3, nama: 'Budi Santoso, S.T., M.Si.', email: 'budi.santoso@dishub.go.id', password: 'password', unit_kerja_id: deptKepeg.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 4, nama: 'Siti Rahmawati, S.H.', email: 'siti.rahmawati@satpolpp.go.id', password: 'password', unit_kerja_id: deptPM.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 5, nama: 'Ir. Hendra Wijaya', email: 'hendra.w@dpu.go.id', password: 'password', unit_kerja_id: deptFastingkom.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 6, nama: 'Dewi Lestari, S.E., M.M.', email: 'dewi.lestari@setda.go.id', password: 'password', unit_kerja_id: deptKepeg.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 7, nama: 'Arnest, S.Kom.', email: 'anggota.demo@pemda.go.id', password: 'password', unit_kerja_id: deptFastingkom.id, role_id: rolePegawai.id }
  });
  await prisma.user.create({
    data: { id: 8, nama: 'Admin Tugas', email: 'admin.tugas@pemda.go.id', password: 'password', unit_kerja_id: deptKepeg.id, role_id: roleTugas.id }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
