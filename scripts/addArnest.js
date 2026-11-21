const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.create({
  data: {
    nama: "Arnest, S.Kom.",
    nip: "200101010001",
    jabatan: "Pegawai",
    golongan: "III/a",
    pangkat: "Penata Muda",
    email: "pegawai.demo@pemda.go.id",
    password: "password123",
    unit_kerja_id: 3,
    role_id: 2,
    is_active: true
  }
}).then(res => console.log("Created Arnest: ", JSON.stringify(res, null, 2))).catch(e => console.error(e)).finally(() => prisma.$disconnect());
