const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateTestLogs() {
  try {
    console.log('🔄 Génération de logs de test...')

    // Récupérer un utilisateur existant
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }

    console.log(`👤 Utilisateur trouvé: ${user.name} (ID: ${user.id})`)

    // Récupérer ou créer une clé API pour cet utilisateur
    let apiKey = await prisma.apiKey.findFirst({
      where: { userId: user.id }
    })

    if (!apiKey) {
      console.log('🔑 Création d\'une clé API de test...')
      apiKey = await prisma.apiKey.create({
        data: {
          userId: user.id,
          key: 'test_' + Math.random().toString(36).substring(2, 15),
          name: 'Clé de test'
        }
      })
    }

    // Générer des logs internes (navigation sur le site)
    const internalEndpoints = [
      { endpoint: '/api/auth/me', method: 'GET' },
      { endpoint: '/api/user/stats', method: 'GET' },
      { endpoint: '/api/user/api-usage', method: 'GET' },
      { endpoint: '/api/projects', method: 'GET' },
      { endpoint: '/api/todos', method: 'GET' },
      { endpoint: '/api/notifications', method: 'GET' }
    ]

    console.log('📊 Génération de logs internes...')
    for (let i = 0; i < 20; i++) {
      const endpoint = internalEndpoints[Math.floor(Math.random() * internalEndpoints.length)]
      const responseTime = Math.floor(Math.random() * 200) + 50
      const statusCode = Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 401 : 500)
      
      await prisma.apiLog.create({
        data: {
          userId: user.id,
          endpoint: endpoint.endpoint,
          method: endpoint.method,
          statusCode,
          responseTime,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          ipAddress: '127.0.0.1',
          isInternal: true,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Derniers 7 jours
        }
      })
    }

    // Générer des logs externes (API avec clé)
    const externalEndpoints = [
      { endpoint: '/api/projects', method: 'GET' },
      { endpoint: '/api/projects', method: 'POST' },
      { endpoint: '/api/todos', method: 'GET' },
      { endpoint: '/api/todos', method: 'POST' },
      { endpoint: '/api/categories', method: 'GET' }
    ]

    console.log('🔌 Génération de logs externes...')
    for (let i = 0; i < 10; i++) {
      const endpoint = externalEndpoints[Math.floor(Math.random() * externalEndpoints.length)]
      const responseTime = Math.floor(Math.random() * 300) + 100
      const statusCode = Math.random() > 0.15 ? (endpoint.method === 'POST' ? 201 : 200) : 400
      
      await prisma.apiLog.create({
        data: {
          userId: user.id,
          apiKeyId: apiKey.id,
          endpoint: endpoint.endpoint,
          method: endpoint.method,
          statusCode,
          responseTime,
          userAgent: 'MyApp/1.0',
          ipAddress: '192.168.1.100',
          isInternal: false,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Derniers 7 jours
        }
      })
    }

    console.log('✅ Logs de test générés avec succès!')
    console.log(`📈 ${20} logs internes et ${10} logs externes créés`)
    console.log('🔍 Vous pouvez maintenant voir les statistiques réelles sur votre page profil')

  } catch (error) {
    console.error('❌ Erreur lors de la génération des logs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateTestLogs() 