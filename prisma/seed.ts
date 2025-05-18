import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password1 = await bcrypt.hash('supersecret123', 10)
  const password2 = await bcrypt.hash('Admin123', 10)

  await prisma.user.createMany({
    data: [
      {
        username: 'minitwitter',
        email: 'test@example.com',
        password: password1,
        active: true,
      },
      {
        username: 'Björn',
        email: 'a@b.ch',
        password: password2,
        active: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Benutzer erfolgreich erstellt ✅')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
