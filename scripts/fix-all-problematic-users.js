const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

async function fixAllProblematicUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Recherche des comptes problématiques...\n')
    
    // Trouver tous les utilisateurs vérifiés sans token de vérification
    const problematicUsers = await prisma.user.findMany({
      where: {
        isVerified: true,
        verificationToken: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    if (problematicUsers.length === 0) {
      console.log('✅ Aucun compte problématique trouvé')
      return
    }
    
    console.log(`⚠️  ${problematicUsers.length} compte(s) problématique(s) trouvé(s):`)
    problematicUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Créé le ${user.createdAt.toLocaleString('fr-FR')}`)
    })
    
    console.log('\n🔧 Correction des comptes...\n')
    
    let correctedCount = 0
    
    for (const user of problematicUsers) {
      try {
        // Générer un nouveau token de vérification
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
        
        // Mettre à jour l'utilisateur
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isVerified: false,
            verificationToken: verificationToken,
            verificationExpires: verificationExpires
          }
        })
        
        console.log(`✅ ${user.email} - Corrigé`)
        console.log(`   Token: ${verificationToken}`)
        console.log(`   Lien: http://localhost:3000/auth/verify?token=${verificationToken}`)
        console.log('')
        
        correctedCount++
        
      } catch (error) {
        console.error(`❌ Erreur lors de la correction de ${user.email}:`, error.message)
      }
    }
    
    console.log(`🎉 ${correctedCount}/${problematicUsers.length} compte(s) corrigé(s) avec succès!`)
    
    if (correctedCount > 0) {
      console.log('\n📧 Actions à effectuer:')
      console.log('1. Configurez votre SMTP pour l\'envoi d\'emails')
      console.log('2. Les utilisateurs devront maintenant vérifier leur email avant de se connecter')
      console.log('3. Vous pouvez envoyer manuellement les liens de vérification ci-dessus')
      console.log('4. Ou utiliser l\'interface admin pour gérer les comptes')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllProblematicUsers() 