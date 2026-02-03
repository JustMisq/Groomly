const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🔵 Testing client creation...');
  const salonId = 'cml5cfmk00001n419wukjupe6'; // Le salon qu'on vient de créer
  
  try {
    const client = await prisma.client.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0612345678',
        salonId,
      }
    });
    console.log('✅ Client created:', client);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
