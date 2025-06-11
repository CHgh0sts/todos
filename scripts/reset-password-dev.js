#!/usr/bin/env node

/**
 * Script pour réinitialiser un mot de passe en développement
 * Utilisation: node scripts/reset-password-dev.js email@example.com nouveaumotdepasse
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const email = process.argv[2]
const newPassword = process.argv[3] || 'password123'

if (!email) {
  console.log('❌ Usage: node scripts/reset-password-dev.js email@example.com [nouveaumotdepasse]')
  console.log('💡 Exemple: node scripts/reset-password-dev.js chghosts.dev@gmail.com password123')
  process.exit(1)
}

async function resetPassword() {
  const prisma = new PrismaClient()
  
  try {
    console.log(`🔄 Réinitialisation du mot de passe pour: ${email}`)
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ Utilisateur non trouvé: ${email}`)
      console.log('\n👥 Utilisateurs disponibles:')
      
      const users = await prisma.user.findMany({
        select: { email: true, name: true }
      })
      
      users.forEach(u => console.log(`   - ${u.email} (${u.name})`))
      return
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Mot de passe mis à jour pour: ${user.name} (${email})`)
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`)
    console.log('\n🚀 Vous pouvez maintenant vous connecter avec:')
    console.log(`   - Email: ${email}`)
    console.log(`   - Mot de passe: ${newPassword}`)
    console.log(`   - URL: http://localhost:3000/auth/login`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword() 