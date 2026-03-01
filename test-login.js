const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('👥 Utilisateurs trouvés:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} | Vérifié: ${user.isVerified} | Rôle: ${user.role}`);
    });
    
    // Vérifier les paramètres système
    const emailVerificationSetting = await prisma.systemSettings.findUnique({
      where: { key: 'emailVerificationRequired' }
    });
    console.log('📧 Vérification email requise:', emailVerificationSetting?.value || 'non défini (défaut: true)');
    
    // Si on a des utilisateurs, testons la vérification de mot de passe
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n🔐 Test de vérification de mot de passe pour: ${firstUser.email}`);
      
      // Récupérer le mot de passe hashé
      const userWithPassword = await prisma.user.findUnique({
        where: { email: firstUser.email },
        select: { password: true }
      });
      
      if (userWithPassword?.password) {
        console.log('✅ Mot de passe hashé trouvé');
        
        // Tester avec un mot de passe commun
        const testPasswords = ['password', '123456', 'admin', 'test', firstUser.email.split('@')[0]];
        
        for (const testPassword of testPasswords) {
          const isValid = await bcrypt.compare(testPassword, userWithPassword.password);
          if (isValid) {
            console.log(`✅ Mot de passe trouvé: "${testPassword}"`);
            break;
          }
        }
      } else {
        console.log('❌ Pas de mot de passe hashé trouvé');
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();