import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Optimisation pour éviter les fuites de connexions
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Gérer la fermeture propre des connexions
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma 