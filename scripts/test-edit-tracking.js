#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEditTracking() {
  console.log('🧪 Test du tracking des modifications avec format "from → to"')
  
  try {
    // Récupérer les 5 dernières activités de type "Edit"
    const editActivities = await prisma.userActivity.findMany({
      where: {
        action: 'Edit'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`\n📊 ${editActivities.length} activités de modification trouvées:\n`)

    editActivities.forEach((activity, index) => {
      console.log(`${index + 1}. 👤 ${activity.user.name}`)
      console.log(`   📅 ${activity.createdAt.toLocaleString('fr-FR')}`)
      console.log(`   🎯 Action: ${activity.action}`)
      
      if (activity.details) {
        const details = activity.details
        console.log(`   📝 Type: ${details.entityType || 'N/A'}`)
        console.log(`   🏷️  Nom: ${details.name || 'N/A'}`)
        
        if (details.changes) {
          console.log(`   🔄 Changements:`)
          Object.entries(details.changes).forEach(([field, change]) => {
            if (change && typeof change === 'object' && change.from !== undefined && change.to !== undefined) {
              console.log(`      • ${field}: "${change.from}" → "${change.to}"`)
            } else {
              console.log(`      • ${field}: ${change}`)
            }
          })
        }
        
        if (details.projectName) {
          console.log(`   📁 Projet: ${details.projectName}`)
        }
      }
      
      console.log(`   🌐 IP: ${activity.ipAddress || 'N/A'}`)
      console.log('')
    })

    // Statistiques
    const totalActivities = await prisma.userActivity.count()
    const editCount = await prisma.userActivity.count({
      where: { action: 'Edit' }
    })
    
    console.log(`📈 Statistiques:`)
    console.log(`   • Total activités: ${totalActivities}`)
    console.log(`   • Modifications: ${editCount}`)
    console.log(`   • Pourcentage: ${((editCount / totalActivities) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEditTracking() 