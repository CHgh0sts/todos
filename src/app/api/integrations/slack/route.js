import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Récupérer la configuration Slack de l'utilisateur
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    // Récupérer la configuration Slack (stockée comme système de settings)
    const slackConfig = await prisma.userIntegration.findFirst({
      where: {
        userId,
        type: 'slack'
      }
    })

    return NextResponse.json({ 
      configured: !!slackConfig,
      settings: slackConfig ? {
        channel: slackConfig.settings.channel,
        events: slackConfig.settings.events || []
      } : null
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la config Slack:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Configurer l'intégration Slack
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { webhookUrl, channel, events } = await request.json()

    // Validation
    if (!webhookUrl || !channel || !events || events.length === 0) {
      return NextResponse.json({ 
        error: 'URL du webhook, canal et événements sont requis' 
      }, { status: 400 })
    }

    // Valider l'URL du webhook Slack
    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json({ 
        error: 'URL de webhook Slack invalide' 
      }, { status: 400 })
    }

    // Tester le webhook
    const testResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: '🚀 CollabWave a été configuré avec succès !',
        channel: channel,
        username: 'CollabWave',
        icon_emoji: ':wave:'
      })
    })

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Impossible de tester le webhook Slack. Vérifiez l\'URL et les permissions.' 
      }, { status: 400 })
    }

    // Sauvegarder la configuration
    await prisma.userIntegration.upsert({
      where: {
        userId_type: {
          userId,
          type: 'slack'
        }
      },
      update: {
        settings: {
          webhookUrl,
          channel,
          events
        },
        active: true
      },
      create: {
        userId,
        type: 'slack',
        settings: {
          webhookUrl,
          channel,
          events
        },
        active: true
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Intégration Slack configurée avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la configuration Slack:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Désactiver l'intégration Slack
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
        type: 'slack'
      },
      data: {
        active: false
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Intégration Slack désactivée' 
    })

  } catch (error) {
    console.error('Erreur lors de la désactivation Slack:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Service pour envoyer des messages Slack
export class SlackService {
  static async sendMessage(userId, eventType, eventData) {
    try {
      const integration = await prisma.userIntegration.findFirst({
        where: {
          userId,
          type: 'slack',
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
        body: JSON.stringify({
          ...message,
          channel: integration.settings.channel,
          username: 'CollabWave',
          icon_emoji: ':wave:'
        })
      })

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message Slack:', error)
    }
  }

  static formatMessage(eventType, eventData) {
    switch (eventType) {
      case 'project.created':
        return {
          text: `🚀 Nouveau projet créé !`,
          attachments: [{
            color: 'good',
            fields: [
              {
                title: 'Projet',
                value: eventData.project.name,
                short: true
              },
              {
                title: 'Créé par',
                value: eventData.user.name,
                short: true
              }
            ]
          }]
        }

      case 'todo.created':
        return {
          text: `✅ Nouvelle tâche créée !`,
          attachments: [{
            color: 'good',
            fields: [
              {
                title: 'Tâche',
                value: eventData.todo.title,
                short: true
              },
              {
                title: 'Projet',
                value: eventData.project.name,
                short: true
              },
              {
                title: 'Créée par',
                value: eventData.user.name,
                short: true
              }
            ]
          }]
        }

      case 'todo.completed':
        return {
          text: `🎉 Tâche terminée !`,
          attachments: [{
            color: 'good',
            fields: [
              {
                title: 'Tâche',
                value: eventData.todo.title,
                short: true
              },
              {
                title: 'Projet',
                value: eventData.project.name,
                short: true
              },
              {
                title: 'Terminée par',
                value: eventData.user.name,
                short: true
              }
            ]
          }]
        }

      default:
        return {
          text: `📢 Événement ${eventType}`,
          attachments: [{
            color: 'warning',
            text: JSON.stringify(eventData, null, 2)
          }]
        }
    }
  }
}

export default SlackService 