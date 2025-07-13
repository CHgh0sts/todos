require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testProjectRealtime() {
  console.log('🔍 Test des notifications temps réel pour les projets...\n');
  
  try {
    // 1. Récupérer un utilisateur de test
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } },
      select: { id: true, name: true, email: true }
    });
    
    if (!testUser) {
      console.log('❌ Aucun utilisateur de test trouvé');
      return;
    }
    
    console.log('👤 Utilisateur de test:', testUser.name, `(${testUser.email})`);
    
    // 2. Créer un token JWT pour l'utilisateur
    const token = jwt.sign(
      { userId: testUser.id, name: testUser.name, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Token JWT généré');
    
    // 3. Se connecter au serveur Socket.IO
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket']
    });
    
    console.log('🔌 Connexion au serveur Socket.IO...');
    
    // 4. Écouter les événements
    socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');
      
      // Écouter les événements de projet
      socket.on('project_created', (data) => {
        console.log('➕ Événement project_created reçu:', data.project?.name);
      });
      
      socket.on('project_updated', (data) => {
        console.log('📝 Événement project_updated reçu:', data.name);
      });
      
      socket.on('project_deleted', (data) => {
        console.log('🗑️ Événement project_deleted reçu:', data.projectName);
      });
      
      // Rejoindre une salle utilisateur
      socket.emit('join_user_room', testUser.id);
      
      console.log('🎯 Écouteurs d\'événements configurés');
      console.log('📡 En attente des événements...');
      
      // Créer un projet de test après 2 secondes
      setTimeout(async () => {
        try {
          console.log('\n🔄 Création d\'un projet de test...');
          
          const testProject = await prisma.project.create({
            data: {
              name: `Test Projet ${Date.now()}`,
              description: 'Projet de test pour les notifications temps réel',
              color: '#FF6B6B',
              emoji: '🧪',
              userId: testUser.id
            }
          });
          
          console.log('✅ Projet de test créé:', testProject.name);
          
          // Simuler l'émission d'un événement Socket.IO
          if (global.io) {
            global.io.to(`user_${testUser.id}`).emit('project_created', {
              project: {
                ...testProject,
                isOwner: true,
                permission: 'admin',
                sharedWith: []
              }
            });
          }
          
          // Attendre 3 secondes puis supprimer le projet
          setTimeout(async () => {
            try {
              console.log('\n🔄 Suppression du projet de test...');
              
              await prisma.project.delete({
                where: { id: testProject.id }
              });
              
              console.log('✅ Projet de test supprimé');
              
              // Simuler l'émission d'un événement Socket.IO
              if (global.io) {
                global.io.to(`user_${testUser.id}`).emit('project_deleted', {
                  projectId: testProject.id,
                  projectName: testProject.name,
                  deletedBy: testUser.id,
                  deletedByName: testUser.name
                });
              }
              
              // Fermer la connexion après 2 secondes
              setTimeout(() => {
                socket.close();
                console.log('\n🔌 Connexion fermée');
                console.log('✅ Test terminé avec succès');
                process.exit(0);
              }, 2000);
              
            } catch (error) {
              console.error('❌ Erreur lors de la suppression:', error);
              socket.close();
              process.exit(1);
            }
          }, 3000);
          
        } catch (error) {
          console.error('❌ Erreur lors de la création:', error);
          socket.close();
          process.exit(1);
        }
      }, 2000);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.IO:', error.message);
      process.exit(1);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('📴 Déconnecté du serveur Socket.IO:', reason);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  } finally {
    // Ne pas fermer Prisma ici car le test peut être asynchrone
    setTimeout(() => {
      prisma.$disconnect();
    }, 10000);
  }
}

// Gérer les signaux de fermeture
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du test...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du test...');
  await prisma.$disconnect();
  process.exit(0);
});

testProjectRealtime(); 