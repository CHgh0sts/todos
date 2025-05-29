#!/usr/bin/env node

const http = require('http')
const { networkInterfaces } = require('os')

// Fonction pour obtenir l'IP locale
const getLocalIP = () => {
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

// Test de connectivité
const testConnection = (host, port = 3000) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          host: host,
          accessible: res.statusCode === 200
        })
      })
    })
    
    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        host: host,
        accessible: false
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      resolve({
        success: false,
        error: 'Timeout',
        host: host,
        accessible: false
      })
    })
    
    req.end()
  })
}

// Test principal
async function runNetworkTests() {
  const localIP = getLocalIP()
  const port = 3000
  
  console.log('🌐 Test de Connectivité Réseau CollabWave')
  console.log('=' .repeat(50))
  console.log(`📍 IP locale détectée: ${localIP}`)
  console.log(`🔌 Port testé: ${port}`)
  console.log('')
  
  const tests = [
    { name: 'Localhost', host: 'localhost' },
    { name: 'Loopback', host: '127.0.0.1' },
    { name: 'IP Locale', host: localIP }
  ]
  
  console.log('🧪 Tests de connectivité:')
  console.log('')
  
  for (const test of tests) {
    process.stdout.write(`   ${test.name.padEnd(12)} (${test.host.padEnd(15)}) ... `)
    
    const result = await testConnection(test.host, port)
    
    if (result.accessible) {
      console.log('✅ ACCESSIBLE')
    } else if (result.success && result.status) {
      console.log(`⚠️  RÉPONSE ${result.status}`)
    } else {
      console.log(`❌ ÉCHEC (${result.error})`)
    }
  }
  
  console.log('')
  
  // Résumé et conseils
  const localhostTest = await testConnection('localhost', port)
  const networkTest = await testConnection(localIP, port)
  
  if (localhostTest.accessible && networkTest.accessible) {
    console.log('🎉 SUCCÈS: L\'application est accessible en local ET sur le réseau!')
    console.log('')
    console.log('📱 Pour accéder depuis un autre appareil:')
    console.log(`   1. Connectez l'appareil au même WiFi`)
    console.log(`   2. Ouvrez un navigateur`)
    console.log(`   3. Allez à: http://${localIP}:${port}`)
    console.log('')
    console.log('💡 Conseil: Utilisez "npm run network-info" pour obtenir un QR code')
    
  } else if (localhostTest.accessible && !networkTest.accessible) {
    console.log('⚠️  PROBLÈME: Accessible en local mais pas sur le réseau')
    console.log('')
    console.log('🔧 Solutions possibles:')
    console.log('   • Vérifiez que le serveur écoute sur 0.0.0.0 (pas seulement localhost)')
    console.log('   • Désactivez temporairement le pare-feu pour tester')
    console.log('   • Vérifiez les règles de pare-feu pour le port 3000')
    console.log('')
    console.log('🍎 Sur macOS:')
    console.log('   sudo pfctl -d  # Désactive temporairement le pare-feu')
    console.log('')
    console.log('🪟 Sur Windows:')
    console.log('   Panneau de configuration > Pare-feu > Autoriser une application')
    
  } else if (!localhostTest.accessible) {
    console.log('❌ PROBLÈME: L\'application n\'est pas accessible du tout')
    console.log('')
    console.log('🔧 Vérifications:')
    console.log('   • Le serveur est-il démarré? (npm run dev)')
    console.log('   • Le port 3000 est-il libre?')
    console.log('   • Y a-t-il des erreurs dans les logs du serveur?')
    console.log('')
    console.log('🔍 Commandes de diagnostic:')
    console.log('   netstat -an | grep 3000')
    console.log('   lsof -i :3000')
  }
  
  console.log('')
  console.log('📊 Informations système:')
  console.log(`   • OS: ${process.platform}`)
  console.log(`   • Node.js: ${process.version}`)
  console.log(`   • IP locale: ${localIP}`)
  
  // Test des ports courants qui pourraient interférer
  console.log('')
  console.log('🔍 Vérification des conflits de ports...')
  
  const commonPorts = [3000, 3001, 8000, 8080]
  for (const testPort of commonPorts) {
    if (testPort !== port) {
      const result = await testConnection(localIP, testPort)
      if (result.accessible) {
        console.log(`   ⚠️  Port ${testPort} également occupé`)
      }
    }
  }
}

// Exécution
runNetworkTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error.message)
  process.exit(1)
}) 