#!/usr/bin/env node

const os = require('os')

console.log('📊 Test des graphiques de monitoring\n')

// Simuler des données historiques
function generateTestData() {
  const data = []
  const now = Date.now()
  
  for (let i = 50; i >= 0; i--) {
    const timestamp = now - (i * 5000) // 5 secondes d'intervalle
    const time = new Date(timestamp).toLocaleTimeString()
    
    // Générer des données réalistes avec des variations
    const baseTime = i / 10
    data.push({
      timestamp,
      time,
      cpuUsage: Math.max(0, Math.min(100, 20 + Math.sin(baseTime) * 15 + Math.random() * 10)),
      memoryUsage: Math.max(50, Math.min(200, 100 + Math.cos(baseTime) * 30 + Math.random() * 20)),
      memoryPercent: Math.max(30, Math.min(90, 60 + Math.sin(baseTime * 0.5) * 20 + Math.random() * 10)),
      diskUsage: Math.max(5, Math.min(15, 8 + Math.sin(baseTime * 0.3) * 2 + Math.random() * 1)),
      diskPercent: Math.max(40, Math.min(80, 55 + Math.cos(baseTime * 0.7) * 15 + Math.random() * 5)),
      requestsPerMinute: Math.max(20, Math.min(300, 150 + Math.sin(baseTime * 2) * 50 + Math.random() * 30)),
      avgResponseTime: Math.max(50, Math.min(200, 100 + Math.cos(baseTime * 1.5) * 30 + Math.random() * 20)),
      errorsPerHour: Math.max(0, Math.min(10, 2 + Math.sin(baseTime * 3) * 2 + Math.random() * 2))
    })
  }
  
  return data
}

// Test de génération de données
console.log('🔄 Génération de données de test...')
const testData = generateTestData()
console.log(`✅ ${testData.length} points de données générés`)

// Afficher quelques statistiques
const latest = testData[testData.length - 1]
console.log('\n📈 Dernières métriques:')
console.log(`  - CPU: ${latest.cpuUsage.toFixed(1)}%`)
console.log(`  - Mémoire: ${latest.memoryUsage.toFixed(1)} MB (${latest.memoryPercent.toFixed(1)}%)`)
console.log(`  - Disque: ${latest.diskUsage.toFixed(1)} GB (${latest.diskPercent.toFixed(1)}%)`)
console.log(`  - Requêtes/min: ${latest.requestsPerMinute.toFixed(0)}`)
console.log(`  - Temps réponse: ${latest.avgResponseTime.toFixed(0)}ms`)
console.log(`  - Erreurs/h: ${latest.errorsPerHour.toFixed(0)}`)

// Calculer des tendances
const first = testData[0]
const cpuTrend = latest.cpuUsage - first.cpuUsage
const memoryTrend = latest.memoryUsage - first.memoryUsage

console.log('\n📊 Tendances:')
console.log(`  - CPU: ${cpuTrend > 0 ? '↗️' : '↘️'} ${Math.abs(cpuTrend).toFixed(1)}%`)
console.log(`  - Mémoire: ${memoryTrend > 0 ? '↗️' : '↘️'} ${Math.abs(memoryTrend).toFixed(1)} MB`)

// Test des informations système réelles
console.log('\n🖥️  Informations système réelles:')
console.log(`  - CPU: ${os.cpus()[0]?.model || 'Unknown'} (${os.cpus().length} cœurs)`)
console.log(`  - Mémoire totale: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`)
console.log(`  - Mémoire libre: ${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`)
console.log(`  - Plateforme: ${os.platform()} ${os.arch()}`)
console.log(`  - Uptime système: ${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`)

console.log('\n✅ Test des graphiques terminé!')
console.log('\n💡 Conseils:')
console.log('  • Les mini-graphiques montrent les 20 derniers points')
console.log('  • Le graphique détaillé permet de filtrer par période')
console.log('  • Les données sont mises à jour toutes les 5 secondes')
console.log('  • Utilisez les filtres pour analyser différentes périodes')

console.log('\n🚀 Allez dans /admin/settings → onglet "Système" pour voir les graphiques!') 