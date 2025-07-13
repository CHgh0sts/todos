require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Création de la sauvegarde de la base de données...');
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    // Exporter les données principales
    console.log('📤 Export des utilisateurs...');
    backup.data.users = await prisma.user.findMany();
    
    console.log('📤 Export des projets...');
    backup.data.projects = await prisma.project.findMany();
    
    console.log('📤 Export des todos...');
    backup.data.todos = await prisma.todo.findMany();
    
    console.log('📤 Export des catégories...');
    backup.data.categories = await prisma.category.findMany();
    
    console.log('📤 Export des partages de projets...');
    backup.data.projectShares = await prisma.projectShare.findMany();
    
    console.log('📤 Export des invitations...');
    backup.data.invitations = await prisma.invitation.findMany();
    
    console.log('📤 Export des notifications...');
    backup.data.notifications = await prisma.notification.findMany();
    
    console.log('📤 Export des demandes d\'amis...');
    backup.data.friendRequests = await prisma.friendRequest.findMany();
    
    console.log('📤 Export des amitiés...');
    backup.data.friendships = await prisma.friendship.findMany();
    
    console.log('📤 Export des liens de partage...');
    backup.data.shareLinks = await prisma.shareLink.findMany();
    
    console.log('📤 Export des clés API...');
    backup.data.apiKeys = await prisma.apiKey.findMany();
    
    console.log('📤 Export des logs d\'activité...');
    backup.data.activityLogs = await prisma.activityLog.findMany();
    
    console.log('📤 Export des activités utilisateur...');
    backup.data.userActivities = await prisma.userActivity.findMany();
    
    console.log('📤 Export des sessions de chat...');
    backup.data.chatSessions = await prisma.chatSession.findMany();
    
    console.log('📤 Export des messages de chat...');
    backup.data.chatMessages = await prisma.chatMessage.findMany();
    
    console.log('📤 Export des paramètres système...');
    backup.data.systemSettings = await prisma.systemSettings.findMany();

    // Créer le nom du fichier de sauvegarde
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_backup_${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'backups', filename);

    // Écrire la sauvegarde
    await fs.promises.writeFile(filepath, JSON.stringify(backup, null, 2));

    console.log(`✅ Sauvegarde créée avec succès : ${filename}`);
    console.log(`📁 Emplacement : ${filepath}`);
    
    // Statistiques
    const stats = Object.entries(backup.data).map(([table, data]) => ({
      table,
      count: data.length
    }));
    
    console.log('\n📊 Statistiques de la sauvegarde :');
    stats.forEach(({ table, count }) => {
      console.log(`   ${table}: ${count} enregistrements`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde :', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase(); 