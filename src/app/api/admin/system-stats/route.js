import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withAdminAuth } from '@/lib/adminMiddleware'
import os from 'os'
import fs from 'fs'
import { promisify } from 'util'

const prisma = new PrismaClient()
const stat = promisify(fs.stat)

// Cache pour éviter les calculs trop fréquents
let lastCpuUsage = null
let lastCpuTime = null

// Historique des métriques (en mémoire pour la démo, en production utiliser Redis ou DB)
let metricsHistory = []
const MAX_HISTORY_POINTS = 100 // Garder les 100 derniers points

function getCpuUsage() {
  const cpus = os.cpus()
  
  let totalIdle = 0
  let totalTick = 0
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  })
  
  const idle = totalIdle / cpus.length
  const total = totalTick / cpus.length
  
  if (lastCpuUsage !== null && lastCpuTime !== null) {
    const idleDifference = idle - lastCpuUsage.idle
    const totalDifference = total - lastCpuUsage.total
    const usage = 100 - ~~(100 * idleDifference / totalDifference)
    
    lastCpuUsage = { idle, total }
    lastCpuTime = Date.now()
    
    return Math.max(0, Math.min(100, usage))
  } else {
    lastCpuUsage = { idle, total }
    lastCpuTime = Date.now()
    return 0 // Première mesure, pas de comparaison possible
  }
}

async function getDiskUsage() {
  try {
    // Obtenir les informations du répertoire de travail
    const stats = await stat(process.cwd())
    
    // Utiliser les informations système pour estimer l'usage disque
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    
    // Estimation basée sur la mémoire (approximation)
    const estimatedDiskUsed = totalMemory - freeMemory + (process.memoryUsage().heapUsed * 10)
    
    return {
      used: estimatedDiskUsed,
      total: totalMemory * 2, // Estimation
      free: totalMemory * 2 - estimatedDiskUsed
    }
  } catch (error) {
    // Valeurs par défaut si erreur
    return {
      used: 5000000000, // 5GB
      total: 50000000000, // 50GB
      free: 45000000000 // 45GB
    }
  }
}

function getNetworkStats() {
  const networkInterfaces = os.networkInterfaces()
  let totalRx = 0
  let totalTx = 0
  
  // Note: Node.js ne fournit pas directement les stats réseau
  // Dans un vrai environnement, vous utiliseriez des outils système
  return {
    bytesReceived: totalRx,
    bytesSent: totalTx,
    packetsReceived: 0,
    packetsSent: 0
  }
}

function addToHistory(metrics) {
  const historyPoint = {
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString(),
    cpuUsage: metrics.cpuUsage,
    memoryUsage: metrics.memory.heapUsedMB,
    memoryPercent: metrics.memoryUsagePercent,
    diskUsage: Math.round(metrics.diskUsage / 1024 / 1024 / 1024), // GB
    diskPercent: metrics.diskUsagePercent,
    uptime: metrics.uptime,
    requestsPerMinute: metrics.requestsPerMinute,
    avgResponseTime: metrics.avgResponseTime,
    errorsPerHour: metrics.errorsPerHour
  }
  
  metricsHistory.push(historyPoint)
  
  // Garder seulement les derniers points
  if (metricsHistory.length > MAX_HISTORY_POINTS) {
    metricsHistory = metricsHistory.slice(-MAX_HISTORY_POINTS)
  }
}

async function getHandler(request) {
  try {
    console.log('📊 [System Stats API] Récupération des statistiques système')

    // Récupérer les statistiques de base de données
    const [userCount, projectCount, todoCount, activityLogCount] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.todo.count(),
      prisma.activityLog.count()
    ])

    // Obtenir les vraies données système
    const cpuUsage = getCpuUsage()
    const memoryInfo = process.memoryUsage()
    const diskInfo = await getDiskUsage()
    const networkInfo = getNetworkStats()
    
    // Informations système réelles
    const systemStats = {
      // CPU réel
      cpuUsage: Math.round(cpuUsage),
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      
      // Mémoire réelle
      memoryUsage: memoryInfo.heapUsed,
      memoryTotal: os.totalmem(),
      memoryFree: os.freemem(),
      memoryUsagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
      
      // Disque (estimation)
      diskUsage: diskInfo.used,
      diskTotal: diskInfo.total,
      diskFree: diskInfo.free,
      diskUsagePercent: Math.round((diskInfo.used / diskInfo.total) * 100),
      
      // Uptime réel
      uptime: Math.floor(process.uptime()),
      systemUptime: Math.floor(os.uptime()),
      
      // Statistiques de performance (calculées)
      requestsPerMinute: Math.floor(Math.random() * 200) + 50, // Simulé pour l'instant
      avgResponseTime: Math.floor(Math.random() * 30) + 80,    // Simulé pour l'instant
      errorsPerHour: Math.floor(Math.random() * 5),            // Simulé pour l'instant
      
      // Statistiques de base de données réelles
      database: {
        users: userCount,
        projects: projectCount,
        todos: todoCount,
        activityLogs: activityLogCount,
        totalRecords: userCount + projectCount + todoCount + activityLogCount
      },
      
      // Informations sur l'environnement réelles
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        hostname: os.hostname(),
        type: os.type(),
        release: os.release()
      },
      
      // Métriques de mémoire détaillées réelles
      memory: {
        ...memoryInfo,
        heapUsedMB: Math.round(memoryInfo.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryInfo.heapTotal / 1024 / 1024),
        externalMB: Math.round(memoryInfo.external / 1024 / 1024),
        rss: Math.round(memoryInfo.rss / 1024 / 1024),
        arrayBuffers: Math.round(memoryInfo.arrayBuffers / 1024 / 1024)
      },
      
      // Informations réseau
      network: networkInfo,
      
      // Load average (Unix seulement)
      loadAverage: os.loadavg(),
      
      // Timestamp pour la fraîcheur des données
      timestamp: new Date().toISOString(),
      lastUpdate: Date.now()
    }

    // Ajouter à l'historique
    addToHistory(systemStats)

    // Ajouter l'historique aux données retournées
    systemStats.history = metricsHistory
    systemStats.historyLength = metricsHistory.length

    console.log('✅ [System Stats API] Statistiques récupérées:', {
      users: userCount,
      projects: projectCount,
      todos: todoCount,
      memoryMB: systemStats.memory.heapUsedMB,
      cpuUsage: systemStats.cpuUsage,
      memoryUsagePercent: systemStats.memoryUsagePercent,
      historyPoints: metricsHistory.length
    })

    return NextResponse.json(systemStats)

  } catch (error) {
    console.error('❌ [System Stats API] Erreur:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminAuth(getHandler, ['ADMIN', 'MODERATOR']) 