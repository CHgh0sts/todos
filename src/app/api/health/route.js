import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`
    
    // Vérifier la mémoire
    const memUsage = process.memoryUsage()
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    
    // Vérifier l'uptime
    const uptime = process.uptime()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      memory: {
        used: memUsageMB,
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      database: 'connected'
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}
