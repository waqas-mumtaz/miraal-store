import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user with hashed password
  const hashedPassword = await bcrypt.hash('Waqas@2025!!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'waqasmumtazkhan@gmail.com' },
    update: {},
    create: {
      email: 'waqasmumtazkhan@gmail.com',
      name: 'Waqas',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Database seeded successfully!')
  console.log('Admin user:', admin.email)
  console.log('Name:', admin.name)
  console.log('Role:', admin.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
