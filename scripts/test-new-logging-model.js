const { PrismaClient } = require('@prisma/client')
const { logAdd, generateTextLog } = require('../src/lib/userActivityLogger')

const prisma = new PrismaClient()

async function testNewLoggingModel() {
  console.log('🧪 Test du nouveau modèle de logging avec textLog...\n')
  
  try {
    // Trouver un utilisateur de test
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    })
    
    if (!testUser) {
      console.log('❌ Aucun utilisateur de test trouvé')
      return
    }
    
    console.log(`👤 Utilisateur de test: ${testUser.name} (ID: ${testUser.id})`)
    
    // Test 1: Création avec champ 'to' et textLog
    console.log('\n📝 Test 1: Création d\'une tâche...')
    const createdData = {
      id: 999,
      title: 'Tâche de test',
      description: 'Description de test',
      completed: false,
      priority: 'high'
    }
    
    const createTextLog = generateTextLog('tâche', 'create', testUser.name, null, createdData)
    console.log(`📄 TextLog généré: "${createTextLog}"`)
    
    await logAdd(
      testUser.id,
      'tâche',
      'create',
      null,
      createdData,
      '127.0.0.1',
      'Test-Agent',
      createTextLog
    )
    
    console.log('✅ Log de création enregistré')
    
    // Test 2: Modification avec champs 'from' et 'to' et textLog
    console.log('\n✏️ Test 2: Modification d\'une tâche...')
    const originalData = {
      id: 999,
      title: 'Tâche de test',
      description: 'Description de test',
      completed: false,
      priority: 'high'
    }
    
    const updatedData = {
      id: 999,
      title: 'Tâche modifiée',
      description: 'Description mise à jour',
      completed: true,
      priority: 'medium'
    }
    
    const editTextLog = generateTextLog('tâche', 'edit', testUser.name, originalData, updatedData)
    console.log(`📄 TextLog généré: "${editTextLog}"`)
    
    await logAdd(
      testUser.id,
      'tâche',
      'edit',
      originalData,
      updatedData,
      '127.0.0.1',
      'Test-Agent',
      editTextLog
    )
    
    console.log('✅ Log de modification enregistré')
    
    // Test 3: Suppression avec champ 'from' et textLog
    console.log('\n🗑️ Test 3: Suppression d\'une tâche...')
    const deletedData = {
      id: 999,
      title: 'Tâche modifiée',
      description: 'Description mise à jour',
      completed: true,
      priority: 'medium'
    }
    
    const deleteTextLog = generateTextLog('tâche', 'delete', testUser.name, deletedData, null)
    console.log(`📄 TextLog généré: "${deleteTextLog}"`)
    
    await logAdd(
      testUser.id,
      'tâche',
      'delete',
      deletedData,
      null,
      '127.0.0.1',
      'Test-Agent',
      deleteTextLog
    )
    
    console.log('✅ Log de suppression enregistré')
    
    // Test 4: Navigation avec textLog
    console.log('\n🧭 Test 4: Navigation...')
    const navTextLog = generateTextLog('navigation', 'Navigation', testUser.name, null, null)
    console.log(`📄 TextLog généré: "${navTextLog}"`)
    
    await logAdd(
      testUser.id,
      'navigation',
      'Navigation',
      null,
      null,
      '127.0.0.1',
      'Test-Agent',
      navTextLog
    )
    
    console.log('✅ Log de navigation enregistré')
    
    // Test 5: Catégorie
    console.log('\n📁 Test 5: Création d\'une catégorie...')
    const categoryData = {
      id: 888,
      name: 'Catégorie de test',
      color: '#FF5733',
      emoji: '🏷️'
    }
    
    const categoryTextLog = generateTextLog('catégorie', 'create', testUser.name, null, categoryData)
    console.log(`📄 TextLog généré: "${categoryTextLog}"`)
    
    await logAdd(
      testUser.id,
      'catégorie',
      'create',
      null,
      categoryData,
      '127.0.0.1',
      'Test-Agent',
      categoryTextLog
    )
    
    console.log('✅ Log de création de catégorie enregistré')
    
    // Test 6: Projet
    console.log('\n📂 Test 6: Création d\'un projet...')
    const projectData = {
      id: 777,
      name: 'Projet de test',
      description: 'Description du projet de test',
      color: '#4CAF50',
      emoji: '🚀'
    }
    
    const projectTextLog = generateTextLog('projet', 'create', testUser.name, null, projectData)
    console.log(`📄 TextLog généré: "${projectTextLog}"`)
    
    await logAdd(
      testUser.id,
      'projet',
      'create',
      null,
      projectData,
      '127.0.0.1',
      'Test-Agent',
      projectTextLog
    )
    
    console.log('✅ Log de création de projet enregistré')
    
    // Test 7: Modification de projet
    console.log('\n✏️ Test 7: Modification d\'un projet...')
    const originalProjectData = {
      id: 777,
      name: 'Projet de test',
      description: 'Description du projet de test',
      color: '#4CAF50',
      emoji: '🚀'
    }
    
    const updatedProjectData = {
      id: 777,
      name: 'Projet modifié',
      description: 'Description mise à jour du projet',
      color: '#FF9800',
      emoji: '⭐'
    }
    
    const editProjectTextLog = generateTextLog('projet', 'edit', testUser.name, originalProjectData, updatedProjectData)
    console.log(`📄 TextLog généré: "${editProjectTextLog}"`)
    
    await logAdd(
      testUser.id,
      'projet',
      'edit',
      originalProjectData,
      updatedProjectData,
      '127.0.0.1',
      'Test-Agent',
      editProjectTextLog
    )
    
    console.log('✅ Log de modification de projet enregistré')
    
    // Test 8: Suppression de projet
    console.log('\n🗑️ Test 8: Suppression d\'un projet...')
    const deleteProjectTextLog = generateTextLog('projet', 'delete', testUser.name, updatedProjectData, null)
    console.log(`📄 TextLog généré: "${deleteProjectTextLog}"`)
    
    await logAdd(
      testUser.id,
      'projet',
      'delete',
      updatedProjectData,
      null,
      '127.0.0.1',
      'Test-Agent',
      deleteProjectTextLog
    )
    
    console.log('✅ Log de suppression de projet enregistré')
    
    // Vérifier les logs créés
    console.log('\n📊 Vérification des logs créés...')
    const recentLogs = await prisma.userActivity.findMany({
      where: {
        userId: testUser.id,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Dernière minute
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log(`\n📈 ${recentLogs.length} logs trouvés dans la dernière minute:`)
    recentLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.typeLog} - ${log.element}`)
      console.log(`   📄 TextLog: "${log.textLog}"`)
      if (log.from) console.log(`   From: ${JSON.stringify(log.from, null, 2)}`)
      if (log.to) console.log(`   To: ${JSON.stringify(log.to, null, 2)}`)
      console.log(`   IP: ${log.ipAddress}, Agent: ${log.userAgent}`)
      console.log('')
    })
    
    console.log('✅ Test du nouveau modèle de logging avec textLog terminé avec succès!')
    console.log(`🎯 ${recentLogs.length} logs testés : tâches, catégories et projets`)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNewLoggingModel() 