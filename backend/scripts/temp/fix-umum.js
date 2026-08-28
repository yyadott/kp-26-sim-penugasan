const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUsersAndDept() {
  const umumDept = await prisma.departemen.findFirst({
    where: { name: 'Umum' }
  });
  
  if (umumDept) {
    const kepegDept = await prisma.departemen.findFirst({
      where: { name: 'Kepeg' }
    });
    
    if (kepegDept) {
      await prisma.user.updateMany({
        where: { departemen_id: umumDept.id },
        data: { departemen_id: kepegDept.id }
      });
      
      await prisma.departemen.delete({
        where: { id: umumDept.id }
      });
      console.log('Moved users to Kepeg and deleted Umum department');
    }
  } else {
    console.log('Umum department not found');
  }
}

fixUsersAndDept()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
