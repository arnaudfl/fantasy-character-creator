import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordUtility } from '../backend/utils/passwordUtility';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await PasswordUtility.hash('Admin123!@#');
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create test user
  const userPassword = await PasswordUtility.hash('User123!@#');
  
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role: UserRole.USER,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 