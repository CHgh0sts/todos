#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const { promisify } = require('util')

const stat = promisify(fs.stat)

console.log('🔍 Test des statistiques système\n')

// Test des informations CPU
console.log('📊 CPU:')
console.log(`  - Modèle: ${os.cpus()[0]?.model || 'Unknown'}`)
console.log(`  - Cœurs: ${os.cpus().length}`)
console.log(`  - Architecture: ${os.arch()}`)

// Test des informations mémoire
const memInfo = process.memoryUsage()
const totalMem = os.totalmem()
const freeMem = os.freemem()
const usedMem = totalMem - freeMem
const memUsagePercent = Math.round((usedMem / totalMem) * 100)

console.log('\n💾 Mémoire:')
console.log(`  - Heap utilisé: ${Math.round(memInfo.heapUsed / 1024 / 1024)} MB`)
console.log(`  - Heap total: ${Math.round(memInfo.heapTotal / 1024 / 1024)} MB`)
console.log(`  - RSS: ${Math.round(memInfo.rss / 1024 / 1024)} MB`)
console.log(`  - External: ${Math.round(memInfo.external / 1024 / 1024)} MB`)
console.log(`  - Mémoire système totale: ${Math.round(totalMem / 1024 / 1024 / 1024)} GB`)
console.log(`  - Mémoire système libre: ${Math.round(freeMem / 1024 / 1024 / 1024)} GB`)
console.log(`  - Utilisation système: ${memUsagePercent}%`)

// Test des informations système
console.log('\n🖥️  Système:')
console.log(`  - Plateforme: ${os.platform()}`)
console.log(`  - Type: ${os.type()}`)
console.log(`  - Release: ${os.release()}`)
console.log(`  - Hostname: ${os.hostname()}`)
console.log(`  - Node.js: ${process.version}`)
console.log(`  - PID: ${process.pid}`)

// Test de l'uptime
console.log('\n⏱️  Uptime:')
console.log(`  - Processus: ${Math.floor(process.uptime())} secondes`)
console.log(`  - Système: ${Math.floor(os.uptime())} secondes`)

// Test du load average (Unix seulement)
if (os.platform() !== 'win32') {
  const loadAvg = os.loadavg()
  console.log('\n📈 Load Average:')
  console.log(`  - 1 min: ${loadAvg[0].toFixed(2)}`)
  console.log(`  - 5 min: ${loadAvg[1].toFixed(2)}`)
  console.log(`  - 15 min: ${loadAvg[2].toFixed(2)}`)
}

// Test des interfaces réseau
console.log('\n🌐 Interfaces réseau:')
const networkInterfaces = os.networkInterfaces()
Object.keys(networkInterfaces).forEach(name => {
  const interfaces = networkInterfaces[name]
  interfaces.forEach(iface => {
    if (!iface.internal) {
      console.log(`  - ${name}: ${iface.address} (${iface.family})`)
    }
  })
})

// Simulation d'un test de performance
console.log('\n🚀 Test de performance...')
const start = Date.now()
let counter = 0
for (let i = 0; i < 1000000; i++) {
  counter += Math.random()
}
const duration = Date.now() - start
console.log(`  - Test terminé en ${duration}ms`)

console.log('\n✅ Test des statistiques système terminé!')
console.log('\n💡 Ces données sont maintenant utilisées en temps réel dans /admin/settings') 