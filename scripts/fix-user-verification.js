const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

async function fixUserVerification() {
  const prisma = new PrismaClient()
  
  try {
    const email = 'oceanejf974@gmail.com' // L'email du compte à corriger
    
    console.log(`🔍 Recherche de l'utilisateur ${email}...`)
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.name} (ID: ${user.id})`)
    console.log(`📧 État actuel: isVerified=${user.isVerified}, token=${user.verificationToken}`)
    
    if (!user.isVerified) {
      console.log('✅ Le compte n\'est déjà pas vérifié, rien à faire')
      return
    }
    
    console.log('🔧 Correction du compte...')
    
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
    
    console.log('✅ Compte corrigé avec succès!')
    console.log(`📧 Nouveau token de vérification: ${verificationToken}`)
    console.log(`⏰ Expire le: ${verificationExpires.toLocaleString('fr-FR')}`)
    console.log('')
    console.log('🔗 Lien de vérification:')
    console.log(`http://localhost:3000/auth/verify?token=${verificationToken}`)
    console.log('')
    console.log('💡 L\'utilisateur devra maintenant vérifier son email avant de pouvoir se connecter')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserVerification() 