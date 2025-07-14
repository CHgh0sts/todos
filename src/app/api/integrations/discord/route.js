import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Récupérer la configuration Discord de l'utilisateur
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    // Récupérer la configuration Discord
    const discordConfig = await prisma.userIntegration.findFirst({
      where: {
        userId,
        type: 'discord'
      }
    })

    return NextResponse.json({ 
      configured: !!discordConfig,
      settings: discordConfig ? {
        serverName: discordConfig.settings.serverName,
        events: discordConfig.settings.events || []
      } : null
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la config Discord:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Configurer l'intégration Discord
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { webhookUrl, serverName, events } = await request.json()

    // Validation
    if (!webhookUrl || !serverName || !events || events.length === 0) {
      return NextResponse.json({ 
        error: 'URL du webhook, nom du serveur et événements sont requis' 
      }, { status: 400 })
    }

    // Valider l'URL du webhook Discord
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && 
        !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      return NextResponse.json({ 
        error: 'URL de webhook Discord invalide' 
      }, { status: 400 })
    }

    // Tester le webhook
    const testResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [{
          title: '🚀 CollabWave configuré avec succès !',
          description: `L'intégration Discord a été configurée pour le serveur **${serverName}**`,
          color: 5814783, // Couleur indigo
          timestamp: new Date().toISOString(),
          footer: {
            text: 'CollabWave',
            icon_url: 'https://cdn.discordapp.com/attachments/placeholder/logo.png'
          }
        }]
      })
    })

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Impossible de tester le webhook Discord. Vérifiez l\'URL et les permissions.' 
      }, { status: 400 })
    }

    // Sauvegarder la configuration
    await prisma.userIntegration.upsert({
      where: {
        userId_type: {
          userId,
          type: 'discord'
        }
      },
      update: {
        settings: {
          webhookUrl,
          serverName,
          events
        },
        active: true
      },
      create: {
        userId,
        type: 'discord',
        settings: {
          webhookUrl,
          serverName,
          events
        },
        active: true
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Intégration Discord configurée avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la configuration Discord:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Désactiver l'intégration Discord
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    await prisma.userIntegration.updateMany({
      where: {
        userId,
        type: 'discord'
      },
      data: {
        active: false
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Intégration Discord désactivée' 
    })

  } catch (error) {
    console.error('Erreur lors de la désactivation Discord:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Service pour envoyer des messages Discord
export class DiscordService {
  static async sendMessage(userId, eventType, eventData) {
    try {
      const integration = await prisma.userIntegration.findFirst({
        where: {
          userId,
          type: 'discord',
          active: true
        }
      })

      if (!integration || !integration.settings.events.includes(eventType)) {
        return
      }

      const message = this.formatMessage(eventType, eventData)
      
      await fetch(integration.settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message Discord:', error)
    }
  }

  static formatMessage(eventType, eventData) {
    const baseEmbed = {
      timestamp: new Date().toISOString(),
      footer: {
        text: 'CollabWave',
        icon_url: 'https://cdn.discordapp.com/attachments/placeholder/logo.png'
      }
    }

    switch (eventType) {
      case 'project.created':
        return {
          embeds: [{
            ...baseEmbed,
            title: '🚀 Nouveau projet créé !',
            description: `Le projet **${eventData.project.name}** a été créé`,
            color: 5814783, // Couleur indigo
            fields: [
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Créé par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'project.updated':
        return {
          embeds: [{
            ...baseEmbed,
            title: '📝 Projet modifié',
            description: `Le projet **${eventData.project.name}** a été modifié`,
            color: 15844367, // Couleur orange
            fields: [
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Modifié par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'project.deleted':
        return {
          embeds: [{
            ...baseEmbed,
            title: '🗑️ Projet supprimé',
            description: `Le projet **${eventData.project.name}** a été supprimé`,
            color: 15158332, // Couleur rouge
            fields: [
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Supprimé par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'todo.created':
        return {
          embeds: [{
            ...baseEmbed,
            title: '✅ Nouvelle tâche créée !',
            description: `Une nouvelle tâche a été créée dans le projet **${eventData.project.name}**`,
            color: 3066993, // Couleur verte
            fields: [
              {
                name: 'Tâche',
                value: eventData.todo.title,
                inline: true
              },
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Créée par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'todo.updated':
        return {
          embeds: [{
            ...baseEmbed,
            title: '📝 Tâche modifiée',
            description: `Une tâche a été modifiée dans le projet **${eventData.project.name}**`,
            color: 15844367, // Couleur orange
            fields: [
              {
                name: 'Tâche',
                value: eventData.todo.title,
                inline: true
              },
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Modifiée par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'todo.completed':
        return {
          embeds: [{
            ...baseEmbed,
            title: '🎉 Tâche terminée !',
            description: `Une tâche a été terminée dans le projet **${eventData.project.name}**`,
            color: 3066993, // Couleur verte
            fields: [
              {
                name: 'Tâche',
                value: eventData.todo.title,
                inline: true
              },
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Terminée par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      case 'collaboration.added':
        return {
          embeds: [{
            ...baseEmbed,
            title: '👥 Nouveau collaborateur',
            description: `Un nouveau collaborateur a rejoint le projet **${eventData.project.name}**`,
            color: 5814783, // Couleur indigo
            fields: [
              {
                name: 'Collaborateur',
                value: eventData.collaborator.name,
                inline: true
              },
              {
                name: 'Projet',
                value: eventData.project.name,
                inline: true
              },
              {
                name: 'Ajouté par',
                value: eventData.user.name,
                inline: true
              }
            ]
          }]
        }

      default:
        return {
          embeds: [{
            ...baseEmbed,
            title: '📢 Événement CollabWave',
            description: `Événement ${eventType} détecté`,
            color: 10070709, // Couleur grise
            fields: [
              {
                name: 'Type d\'événement',
                value: eventType,
                inline: true
              },
              {
                name: 'Données',
                value: '```json\n' + JSON.stringify(eventData, null, 2) + '\n```',
                inline: false
              }
            ]
          }]
        }
    }
  }
}

export default DiscordService 