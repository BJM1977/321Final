import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Rollen einfügen
  const [userRole, adminRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: 'User' },
      update: {},
      create: { name: 'User' },
    }),
    prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    }),
  ]);

  // Passwörter hashen
  const password1 = await bcrypt.hash('supersecret123', 10);
  const password2 = await bcrypt.hash('Admin123', 10);

  // Nutzer einfügen mit roleId
  await prisma.user.createMany({
    data: [
      {
        username: 'minitwitter',
        email: 'test@example.com',
        password: password1,
        active: true,
        roleId: userRole.id,
      },
      {
        username: 'Björn',
        email: 'a@b.ch',
        password: password2,
        active: true,
        roleId: adminRole.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Rollen und Benutzer erfolgreich erstellt');
}

main()
  .catch((err) => {
    console.error('❌ Fehler beim Seed:', err);
  })
  .finally(() => prisma.$disconnect());
