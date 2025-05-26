const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding...')

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Utilisateur Test',
      password: hashedPassword,
      theme: 'system'
    }
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer un projet de test
  const project = await prisma.project.create({
    data: {
      name: 'Projet de Test',
      description: 'Un projet exemple pour tester PostgreSQL',
      color: '#3B82F6',
      emoji: '🚀',
      userId: user.id
    }
  })

  console.log('✅ Projet créé:', project.name)

  // Créer des catégories de test
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Développement',
        color: '#10B981',
        emoji: '💻',
        userId: user.id,
        projectId: project.id
      },
      {
        name: 'Design',
        color: '#F59E0B',
        emoji: '🎨',
        userId: user.id,
        projectId: project.id
      }
    ]
  })

  console.log('✅ Catégories créées')

  // Récupérer les catégories pour avoir leurs IDs
  const devCategory = await prisma.category.findFirst({
    where: { name: 'Développement', userId: user.id }
  })

  // Créer des todos de test
  const todos = await prisma.todo.createMany({
    data: [
      {
        title: 'Configurer PostgreSQL',
        description: 'Migrer la base de données de SQLite vers PostgreSQL',
        priority: 'high',
        completed: true,
        userId: user.id,
        projectId: project.id,
        categoryId: devCategory.id
      },
      {
        title: 'Tester les APIs',
        description: 'Vérifier que toutes les APIs fonctionnent avec PostgreSQL',
        priority: 'medium',
        userId: user.id,
        projectId: project.id,
        categoryId: devCategory.id
      },
      {
        title: 'Optimiser les performances',
        description: 'Analyser et améliorer les requêtes PostgreSQL',
        priority: 'low',
        dueDate: new Date('2024-06-01'),
        userId: user.id,
        projectId: project.id
      }
    ]
  })

  console.log('✅ Todos créés')

  console.log('🎉 Seeding terminé avec succès!')
  console.log(`
📧 Email: test@example.com
🔑 Mot de passe: password123
🎯 Projet: ${project.name}
📊 ${todos.count} todos créés
  `)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 