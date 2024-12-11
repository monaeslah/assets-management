import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main () {
  // Static departments
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
      update: {}, // Update is empty to prevent overwriting
      create: { name: department.name }
    })
  }

  console.log('Static departments added.')
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
