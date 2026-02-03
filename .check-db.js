const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n=== USERS ===');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    users.forEach(u => console.log(`${u.email} - ID: ${u.id}`));
    
    console.log('\n=== SALONS ===');
    const salons = await prisma.salon.findMany({
      select: { id: true, userId: true, name: true }
    });
    salons.forEach(s => console.log(`${s.name} - userId: ${s.userId}`));
    
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
