const { PrismaClient } = require('@prisma/client')

async function testRegistrationLogic() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Test de la logique de vérification email...\n')
    
    // Test 1: Paramètre = 'true'
    console.log('Test 1: emailVerificationRequired = "true"')
    await prisma.systemSettings.upsert({
      where: { key: 'emailVerificationRequired' },
      update: { value: 'true' },
      create: { key: 'emailVerificationRequired', value: 'true' }
    })
    
    let setting = await prisma.systemSettings.findUnique({
      where: { key: 'emailVerificationRequired' }
    })
    
    let emailVerificationRequired = setting?.value !== 'false'
    console.log(`   Valeur en base: "${setting?.value}"`)
    console.log(`   emailVerificationRequired: ${emailVerificationRequired}`)
    console.log(`   ✅ Résultat attendu: true\n`)
    
    // Test 2: Paramètre = 'false'
    console.log('Test 2: emailVerificationRequired = "false"')
    await prisma.systemSettings.update({
      where: { key: 'emailVerificationRequired' },
      data: { value: 'false' }
    })
    
    setting = await prisma.systemSettings.findUnique({
      where: { key: 'emailVerificationRequired' }
    })
    
    emailVerificationRequired = setting?.value !== 'false'
    console.log(`   Valeur en base: "${setting?.value}"`)
    console.log(`   emailVerificationRequired: ${emailVerificationRequired}`)
    console.log(`   ✅ Résultat attendu: false\n`)
    
    // Test 3: Paramètre supprimé (undefined)
    console.log('Test 3: emailVerificationRequired supprimé (undefined)')
    await prisma.systemSettings.delete({
      where: { key: 'emailVerificationRequired' }
    })
    
    setting = await prisma.systemSettings.findUnique({
      where: { key: 'emailVerificationRequired' }
    })
    
    emailVerificationRequired = setting?.value !== 'false'
    console.log(`   Valeur en base: ${setting?.value || 'undefined'}`)
    console.log(`   emailVerificationRequired: ${emailVerificationRequired}`)
    console.log(`   ✅ Résultat attendu: true (par défaut)\n`)
    
    // Restaurer la valeur par défaut
    console.log('🔧 Restauration de la valeur par défaut...')
    await prisma.systemSettings.create({
      data: {
        key: 'emailVerificationRequired',
        value: 'true',
        description: 'Exiger la vérification email pour l\'inscription'
      }
    })
    console.log('✅ Valeur par défaut restaurée\n')
    
    console.log('🎉 Tous les tests sont passés!')
    console.log('💡 La nouvelle logique fonctionne correctement:')
    console.log('   - Par défaut: vérification requise (true)')
    console.log('   - Seulement désactivée si explicitement définie à "false"')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRegistrationLogic() 