const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({where: {id: {in: [1, 2, 8]}}}).then(res => console.log(JSON.stringify(res, null, 2))).finally(() => prisma.$disconnect());
