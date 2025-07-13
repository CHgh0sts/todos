require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaStudio() {
  console.log('🔍 Test de la connexion à Prisma Studio et à la base de données...\n');
  
  try {
    // Test de connexion à la base de données
    console.log('1. Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie\n');
    
    // Test des modèles principaux
    console.log('2. Test des modèles principaux...');
    
    // Test du modèle User
    console.log('   📊 Modèle User...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ ${userCount} utilisateurs trouvés`);
    
    // Test du modèle Project
    console.log('   📊 Modèle Project...');
    const projectCount = await prisma.project.count();
    console.log(`   ✅ ${projectCount} projets trouvés`);
    
    // Test du modèle Todo
    console.log('   📊 Modèle Todo...');
    const todoCount = await prisma.todo.count();
    console.log(`   ✅ ${todoCount} todos trouvés`);
    
    // Test du modèle Category
    console.log('   📊 Modèle Category...');
    const categoryCount = await prisma.category.count();
    console.log(`   ✅ ${categoryCount} catégories trouvées`);
    
    // Test du modèle ProjectShare
    console.log('   📊 Modèle ProjectShare...');
    const shareCount = await prisma.projectShare.count();
    console.log(`   ✅ ${shareCount} partages de projets trouvés`);
    
    // Test du modèle Invitation
    console.log('   📊 Modèle Invitation...');
    const invitationCount = await prisma.invitation.count();
    console.log(`   ✅ ${invitationCount} invitations trouvées`);
    
    // Test du modèle Notification
    console.log('   📊 Modèle Notification...');
    const notificationCount = await prisma.notification.count();
    console.log(`   ✅ ${notificationCount} notifications trouvées`);
    
    // Test du modèle FriendRequest
    console.log('   📊 Modèle FriendRequest...');
    const friendRequestCount = await prisma.friendRequest.count();
    console.log(`   ✅ ${friendRequestCount} demandes d'amis trouvées`);
    
    // Test du modèle Friendship
    console.log('   📊 Modèle Friendship...');
    const friendshipCount = await prisma.friendship.count();
    console.log(`   ✅ ${friendshipCount} amitiés trouvées`);
    
    // Test du modèle ShareLink
    console.log('   📊 Modèle ShareLink...');
    const shareLinkCount = await prisma.shareLink.count();
    console.log(`   ✅ ${shareLinkCount} liens de partage trouvés`);
    
    // Test du modèle ActivityLog
    console.log('   📊 Modèle ActivityLog...');
    const activityLogCount = await prisma.activityLog.count();
    console.log(`   ✅ ${activityLogCount} logs d'activité trouvés`);
    
    // Test du modèle UserActivity
    console.log('   📊 Modèle UserActivity...');
    const userActivityCount = await prisma.userActivity.count();
    console.log(`   ✅ ${userActivityCount} activités utilisateur trouvées`);
    
    // Test du modèle ChatSession
    console.log('   📊 Modèle ChatSession...');
    const chatSessionCount = await prisma.chatSession.count();
    console.log(`   ✅ ${chatSessionCount} sessions de chat trouvées`);
    
    // Test du modèle ChatMessage
    console.log('   📊 Modèle ChatMessage...');
    const chatMessageCount = await prisma.chatMessage.count();
    console.log(`   ✅ ${chatMessageCount} messages de chat trouvés`);
    
    // Test du modèle SystemSettings
    console.log('   📊 Modèle SystemSettings...');
    const systemSettingsCount = await prisma.systemSettings.count();
    console.log(`   ✅ ${systemSettingsCount} paramètres système trouvés`);
    
    console.log('\n🎉 Tous les tests ont réussi !');
    console.log('✅ Prisma Studio devrait maintenant fonctionner correctement');
    console.log('🌐 Accédez à Prisma Studio sur : http://localhost:5555');
    
  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaStudio(); 