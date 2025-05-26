const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding collaboration...')

  // Créer plusieurs utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = []
  const userEmails = ['alice@example.com', 'bob@example.com', 'charlie@example.com']
  const userNames = ['Alice Martin', 'Bob Dupont', 'Charlie Moreau']
  
  for (let i = 0; i < 3; i++) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userEmails[i],
          name: userNames[i],
          password: hashedPassword,
          theme: 'system'
        }
      })
      users.push(user)
      console.log('✅ Utilisateur créé:', user.email)
    } catch (error) {
      if (error.code === 'P2002') {
        // L'utilisateur existe déjà, le récupérer
        const user = await prisma.user.findUnique({
          where: { email: userEmails[i] }
        })
        users.push(user)
        console.log('👤 Utilisateur existant:', user.email)
      } else {
        throw error
      }
    }
  }

  // Créer des projets pour différents utilisateurs
  const projects = []
  const projectData = [
    {
      name: 'Projet Équipe Alpha',
      description: 'Développement de l\'application mobile',
      color: '#3B82F6',
      emoji: '📱',
      userId: users[0].id
    },
    {
      name: 'Site Web Marketing',
      description: 'Refonte complète du site web commercial',
      color: '#10B981',
      emoji: '🌐',
      userId: users[1].id
    },
    {
      name: 'Formation Interne',
      description: 'Organisation des sessions de formation pour l\'équipe',
      color: '#F59E0B',
      emoji: '🎓',
      userId: users[2].id
    }
  ]

  for (const projectInfo of projectData) {
    const project = await prisma.project.create({
      data: projectInfo
    })
    projects.push(project)
    console.log('✅ Projet créé:', project.name)
  }

  // Créer des partages de projets (collaborations existantes)
  const shares = [
    {
      projectId: projects[0].id, // Projet d'Alice
      userId: users[1].id, // Partagé avec Bob
      ownerId: users[0].id,
      permission: 'edit'
    },
    {
      projectId: projects[1].id, // Projet de Bob
      userId: users[2].id, // Partagé avec Charlie
      ownerId: users[1].id,
      permission: 'view'
    }
  ]

  for (const shareData of shares) {
    const share = await prisma.projectShare.create({
      data: shareData
    })
    console.log('✅ Collaboration créée')
  }

  // Créer des invitations en attente
  const invitations = [
    {
      projectId: projects[0].id, // Projet d'Alice
      senderId: users[0].id, // Envoyé par Alice
      receiverId: users[2].id, // À Charlie
      email: users[2].email,
      permission: 'admin',
      message: 'Salut Charlie ! J\'aimerais que tu rejoignes notre équipe de développement mobile en tant qu\'admin. Ton expertise sera précieuse !'
    },
    {
      projectId: projects[2].id, // Projet de Charlie
      senderId: users[2].id, // Envoyé par Charlie
      receiverId: users[0].id, // À Alice
      email: users[0].email,
      permission: 'edit',
      message: 'Alice, peux-tu m\'aider à organiser les formations ? Tu as une excellente expérience en gestion de projet.'
    }
  ]

  for (const invitationData of invitations) {
    const invitation = await prisma.invitation.create({
      data: invitationData
    })
    console.log('✅ Invitation créée')
  }

  // Créer des notifications pour les invitations
  const notifications = [
    {
      userId: users[2].id, // Pour Charlie
      type: 'invitation_received',
      title: 'Nouvelle invitation de collaboration',
      message: `${users[0].name} vous a invité à collaborer sur le projet "${projects[0].name}"`,
      data: JSON.stringify({ invitationId: 1, projectId: projects[0].id })
    },
    {
      userId: users[0].id, // Pour Alice
      type: 'invitation_received',
      title: 'Nouvelle invitation de collaboration',
      message: `${users[2].name} vous a invité à collaborer sur le projet "${projects[2].name}"`,
      data: JSON.stringify({ invitationId: 2, projectId: projects[2].id })
    },
    {
      userId: users[1].id, // Pour Bob
      type: 'project_shared',
      title: 'Accès accordé à un projet',
      message: `${users[0].name} vous a donné accès au projet "${projects[0].name}" avec les droits de modification`,
      data: JSON.stringify({ projectId: projects[0].id })
    }
  ]

  for (const notificationData of notifications) {
    const notification = await prisma.notification.create({
      data: notificationData
    })
    console.log('✅ Notification créée')
  }

  // Créer quelques todos dans les projets partagés
  const todos = [
    {
      title: 'Conception de l\'interface utilisateur',
      description: 'Créer les wireframes et mockups pour l\'app mobile',
      priority: 'high',
      userId: users[0].id,
      projectId: projects[0].id
    },
    {
      title: 'Développement API backend',
      description: 'Mise en place des endpoints REST pour l\'application',
      priority: 'medium',
      userId: users[1].id, // Bob travaille sur le projet d'Alice
      projectId: projects[0].id
    },
    {
      title: 'Rédaction du contenu marketing',
      description: 'Écrire les textes pour les nouvelles pages du site',
      priority: 'medium',
      userId: users[1].id,
      projectId: projects[1].id
    }
  ]

  for (const todoData of todos) {
    const todo = await prisma.todo.create({
      data: todoData
    })
    console.log('✅ Todo créé:', todo.title)
  }

  console.log('🎉 Seeding collaboration terminé avec succès!')
  console.log(`
📧 Utilisateurs créés :
  - ${users[0].email} (Alice) - Mot de passe: password123
  - ${users[1].email} (Bob) - Mot de passe: password123  
  - ${users[2].email} (Charlie) - Mot de passe: password123

🤝 Collaborations :
  - Bob peut modifier le projet d'Alice
  - Charlie peut voir le projet de Bob
  
📨 Invitations en attente :
  - Charlie invité comme admin sur le projet d'Alice
  - Alice invitée comme éditrice sur le projet de Charlie
  
🔔 Notifications créées pour tester le système
  `)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding collaboration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 