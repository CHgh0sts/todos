const { WebhookService } = require('../src/lib/webhookService.js')

async function testRealWebhook() {
  console.log('🧪 Test d\'envoi d\'un webhook Discord réel...\n')
  
  // Données de test pour l'utilisateur ID 2 (CHghosts)
  const testData = {
    project: {
      id: 999,
      name: 'Test Project Discord',
      description: 'Test pour vérifier les notifications Discord',
      color: '#5865F2',
      emoji: '🧪',
      createdAt: new Date()
    },
    user: {
      id: 2,
      name: 'CHghosts',
      email: 'chghosts.dev@gmail.com'
    }
  }
  
  try {
    console.log('📤 Envoi d\'un webhook test à Discord...')
    
    // Envoyer le webhook pour l'utilisateur ID 2
    await WebhookService.sendWebhook('project.created', testData, 2)
    
    console.log('✅ Webhook envoyé ! Vérifiez votre canal Discord.')
    console.log('📋 Données envoyées:', JSON.stringify(testData, null, 2))
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du webhook:', error)
  }
}

if (require.main === module) {
  testRealWebhook()
}

module.exports = { testRealWebhook } 