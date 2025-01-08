import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main () {
  const departments = [
    { name: 'Engineering' },
    { name: 'Human Resources (HR)' },
    { name: 'Marketing' },
    { name: 'Finance' },
    { name: 'none' }
  ]

  for (const department of departments) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: {},
      create: { name: department.name }
    })
  }

  console.log('Static departments added.')
  const hashedPassword = await bcrypt.hash('securepassword', 10)
  //create super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
      departmentId: null
    }
  })
  console.log('Super Admin created:', superAdmin)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
