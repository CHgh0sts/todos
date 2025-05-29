#!/usr/bin/env node

const { networkInterfaces } = require('os')

// Fonction pour obtenir l'IP locale
const getLocalIP = () => {
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ignorer les adresses non-IPv4 et les adresses de loopback
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

// Fonction pour générer un QR code ASCII simple
const generateQRCode = (text) => {
  // QR code ASCII simple (vous pouvez installer qrcode-terminal pour un vrai QR code)
  console.log(`\n📱 QR Code pour: ${text}`)
  console.log('┌─────────────────────────────┐')
  console.log('│ ██ ▄▄▄▄▄ █▄█ ▄▄▄▄▄ ██      │')
  console.log('│ ██ █   █ ███ █   █ ██      │')
  console.log('│ ██ █▄▄▄█ █▀█ █▄▄▄█ ██      │')
  console.log('│ ██▄▄▄▄▄▄▄█▄█▄▄▄▄▄▄▄██      │')
  console.log('│ ██ ▀▀▀▀▀ █▄█ ▀▀▀▀▀ ██      │')
  console.log('│ ██▄▄▄▄▄▄▄█▄█▄▄▄▄▄▄▄██      │')
  console.log('└─────────────────────────────┘')
  console.log('(Installez qrcode-terminal pour un vrai QR code)')
}

const port = process.env.PORT || '3000'
const localIP = getLocalIP()
const localUrl = `http://${localIP}:${port}`

console.log('🌐 Informations d\'accès réseau CollabWave')
console.log('=' .repeat(50))
console.log(`🏠 Accès local:     http://localhost:${port}`)
console.log(`🌐 Accès réseau:    ${localUrl}`)
console.log(`📱 IP de votre PC:  ${localIP}`)
console.log('')

console.log('📋 Instructions pour accéder depuis un autre appareil:')
console.log('1. Assurez-vous que les deux appareils sont sur le même réseau WiFi')
console.log('2. Vérifiez que votre firewall autorise les connexions sur le port', port)
console.log('3. Sur l\'autre appareil, ouvrez un navigateur et allez à:')
console.log(`   ${localUrl}`)
console.log('')

console.log('🔧 Dépannage:')
console.log('• Si ça ne fonctionne pas, essayez de désactiver temporairement le firewall')
console.log('• Sur macOS: Préférences Système > Sécurité > Pare-feu')
console.log('• Sur Windows: Panneau de configuration > Système et sécurité > Pare-feu Windows')
console.log('• Ou ajoutez une exception pour le port', port)
console.log('')

// Essayer d'installer et utiliser qrcode-terminal si disponible
try {
  const qrcode = require('qrcode-terminal')
  console.log('📱 QR Code pour accès mobile:')
  qrcode.generate(localUrl, { small: true })
} catch (error) {
  generateQRCode(localUrl)
  console.log('\n💡 Conseil: Installez qrcode-terminal pour un vrai QR code:')
  console.log('   npm install qrcode-terminal')
}

console.log('\n🚀 Démarrez le serveur avec: npm run dev')
console.log('📱 Puis utilisez l\'adresse réseau ci-dessus sur vos autres appareils') 