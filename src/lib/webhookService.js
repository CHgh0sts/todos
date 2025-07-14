import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Service pour envoyer des webhooks
export class WebhookService {
  
  // Envoyer un webhook à tous les utilisateurs qui ont configuré cet événement
  static async sendWebhook(eventType, eventData, userId) {
    try {
      // Récupérer tous les webhooks actifs pour cet utilisateur et cet événement
      const webhooks = await prisma.webhook.findMany({
        where: {
          userId,
          active: true,
          events: {
            has: eventType
          }
        }
      })

      // Récupérer les intégrations actives (Slack et Discord)
      const integrations = await prisma.userIntegration.findMany({
        where: {
          userId,
          active: true,
          type: {
            in: ['slack', 'discord']
          }
        }
      })

      const totalNotifications = webhooks.length + integrations.filter(i => i.settings.events?.includes(eventType)).length

      if (totalNotifications === 0) {
        console.log(`🪝 [Webhook] Aucun webhook/intégration configuré pour l'événement ${eventType}`)
        return
      }

      console.log(`🪝 [Webhook] Envoi de ${totalNotifications} notification(s) pour l'événement ${eventType}`)

      // Préparer le payload pour les webhooks classiques
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: eventData
      }

      // Envoyer les webhooks classiques
      const webhookPromises = webhooks.map(webhook => 
        this.sendSingleWebhook(webhook, payload)
      )

      // Envoyer les intégrations
      const integrationPromises = integrations.map(integration => 
        this.sendIntegration(integration, eventType, eventData)
      )

      await Promise.all([...webhookPromises, ...integrationPromises])

    } catch (error) {
      console.error('🪝 [Webhook] Erreur lors de l\'envoi des webhooks:', error)
    }
  }

  // Envoyer un webhook individuel
  static async sendSingleWebhook(webhook, payload) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'CollabWave-Webhook/1.0',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery': crypto.randomUUID()
      }

      // Signer le payload si un secret est configuré
      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex')
        headers['X-Webhook-Signature'] = `sha256=${signature}`
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        timeout: 10000 // 10 secondes de timeout
      })

      // Mettre à jour la date de dernière utilisation
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { lastUsed: new Date() }
      })

      if (response.ok) {
        console.log(`🪝 [Webhook] Webhook envoyé avec succès à ${webhook.url}`)
      } else {
        console.error(`🪝 [Webhook] Erreur ${response.status} lors de l'envoi à ${webhook.url}`)
        // TODO: Implémenter un système de retry et de désactivation automatique
      }

    } catch (error) {
      console.error(`🪝 [Webhook] Erreur lors de l'envoi à ${webhook.url}:`, error.message)
      // TODO: Implémenter un système de retry et de désactivation automatique
    }
  }

  // Envoyer une notification d'intégration (Slack/Discord)
  static async sendIntegration(integration, eventType, eventData) {
    try {
      // Vérifier si l'intégration est configurée pour cet événement
      if (!integration.settings.events?.includes(eventType)) {
        return
      }

      if (integration.type === 'slack') {
        await this.sendSlackMessage(integration, eventType, eventData)
      } else if (integration.type === 'discord') {
        await this.sendDiscordMessage(integration, eventType, eventData)
      }

    } catch (error) {
      console.error(`🪝 [Integration] Erreur lors de l'envoi de l'intégration ${integration.type}:`, error)
    }
  }

  // Envoyer un message Slack
  static async sendSlackMessage(integration, eventType, eventData) {
    try {
      const message = this.formatSlackMessage(eventType, eventData)
      
      const response = await fetch(integration.settings.webhookUrl, {
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

      if (response.ok) {
        console.log(`🪝 [Slack] Message envoyé avec succès`)
      } else {
        console.error(`🪝 [Slack] Erreur ${response.status} lors de l'envoi`)
      }

    } catch (error) {
      console.error('🪝 [Slack] Erreur lors de l\'envoi:', error)
    }
  }

  // Envoyer un message Discord
  static async sendDiscordMessage(integration, eventType, eventData) {
    try {
      const message = this.formatDiscordMessage(eventType, eventData)
      
      const response = await fetch(integration.settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      if (response.ok) {
        console.log(`🪝 [Discord] Message envoyé avec succès`)
      } else {
        console.error(`🪝 [Discord] Erreur ${response.status} lors de l'envoi`)
      }

    } catch (error) {
      console.error('🪝 [Discord] Erreur lors de l\'envoi:', error)
    }
  }

  // Formater un message Slack
  static formatSlackMessage(eventType, eventData) {
    switch (eventType) {
      case 'project.created':
        return {
          text: `🚀 Nouveau projet créé !`,
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Projet', value: eventData.project.name, short: true },
              { title: 'Créé par', value: eventData.user.name, short: true }
            ]
          }]
        }

      case 'todo.created':
        return {
          text: `✅ Nouvelle tâche créée !`,
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Tâche', value: eventData.todo.title, short: true },
              { title: 'Projet', value: eventData.project.name, short: true },
              { title: 'Créée par', value: eventData.user.name, short: true }
            ]
          }]
        }

      case 'todo.completed':
        return {
          text: `🎉 Tâche terminée !`,
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Tâche', value: eventData.todo.title, short: true },
              { title: 'Projet', value: eventData.project.name, short: true },
              { title: 'Terminée par', value: eventData.user.name, short: true }
            ]
          }]
        }

      case 'collaboration.added':
        return {
          text: `👥 Nouveau collaborateur !`,
          attachments: [{
            color: 'good',
            fields: [
              { title: 'Collaborateur', value: eventData.collaborator.name, short: true },
              { title: 'Projet', value: eventData.project.name, short: true },
              { title: 'Ajouté par', value: eventData.user.name, short: true },
              { title: 'Permission', value: eventData.collaboration.permission, short: true }
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

  // Formater un message Discord
  static formatDiscordMessage(eventType, eventData) {
    const baseEmbed = {
      timestamp: new Date().toISOString(),
      footer: { text: 'CollabWave' }
    }

    switch (eventType) {
      case 'project.created':
        return {
          embeds: [{
            ...baseEmbed,
            title: '🚀 Nouveau projet créé !',
            description: `Le projet **${eventData.project.name}** a été créé`,
            color: 5814783,
            fields: [
              { name: 'Projet', value: eventData.project.name, inline: true },
              { name: 'Créé par', value: eventData.user.name, inline: true }
            ]
          }]
        }

      case 'todo.created':
        return {
          embeds: [{
            ...baseEmbed,
            title: '✅ Nouvelle tâche créée !',
            description: `Une nouvelle tâche a été créée dans le projet **${eventData.project.name}**`,
            color: 3066993,
            fields: [
              { name: 'Tâche', value: eventData.todo.title, inline: true },
              { name: 'Projet', value: eventData.project.name, inline: true },
              { name: 'Créée par', value: eventData.user.name, inline: true }
            ]
          }]
        }

      case 'todo.completed':
        return {
          embeds: [{
            ...baseEmbed,
            title: '🎉 Tâche terminée !',
            description: `Une tâche a été terminée dans le projet **${eventData.project.name}**`,
            color: 3066993,
            fields: [
              { name: 'Tâche', value: eventData.todo.title, inline: true },
              { name: 'Projet', value: eventData.project.name, inline: true },
              { name: 'Terminée par', value: eventData.user.name, inline: true }
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
              { name: 'Collaborateur', value: eventData.collaborator.name, inline: true },
              { name: 'Projet', value: eventData.project.name, inline: true },
              { name: 'Ajouté par', value: eventData.user.name, inline: true },
              { name: 'Permission', value: eventData.collaboration.permission, inline: true }
            ]
          }]
        }

      default:
        return {
          embeds: [{
            ...baseEmbed,
            title: '📢 Événement CollabWave',
            description: `Événement ${eventType} détecté`,
            color: 10070709,
            fields: [
              { name: 'Type d\'événement', value: eventType, inline: true },
              { name: 'Données', value: '```json\n' + JSON.stringify(eventData, null, 2) + '\n```', inline: false }
            ]
          }]
        }
    }
  }

  // Événements disponibles avec leurs descriptions
  static getAvailableEvents() {
    return [
      {
        event: 'project.created',
        description: 'Déclenché lors de la création d\'un nouveau projet',
        payload: {
          project: {
            id: 'number',
            name: 'string',
            description: 'string',
            color: 'string',
            emoji: 'string',
            userId: 'number',
            createdAt: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'project.updated',
        description: 'Déclenché lors de la modification d\'un projet',
        payload: {
          project: {
            id: 'number',
            name: 'string',
            description: 'string',
            color: 'string',
            emoji: 'string',
            userId: 'number',
            updatedAt: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'project.deleted',
        description: 'Déclenché lors de la suppression d\'un projet',
        payload: {
          project: {
            id: 'number',
            name: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'todo.created',
        description: 'Déclenché lors de la création d\'une nouvelle tâche',
        payload: {
          todo: {
            id: 'number',
            title: 'string',
            description: 'string',
            completed: 'boolean',
            priority: 'string',
            projectId: 'number',
            userId: 'number',
            createdAt: 'string'
          },
          project: {
            id: 'number',
            name: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'todo.updated',
        description: 'Déclenché lors de la modification d\'une tâche',
        payload: {
          todo: {
            id: 'number',
            title: 'string',
            description: 'string',
            completed: 'boolean',
            priority: 'string',
            projectId: 'number',
            userId: 'number',
            updatedAt: 'string'
          },
          project: {
            id: 'number',
            name: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'todo.completed',
        description: 'Déclenché lorsqu\'une tâche est marquée comme terminée',
        payload: {
          todo: {
            id: 'number',
            title: 'string',
            completed: 'boolean',
            completedAt: 'string',
            projectId: 'number',
            userId: 'number'
          },
          project: {
            id: 'number',
            name: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      },
      {
        event: 'collaboration.added',
        description: 'Déclenché lors de l\'ajout d\'un collaborateur',
        payload: {
          collaboration: {
            projectId: 'number',
            userId: 'number',
            permission: 'string',
            addedAt: 'string'
          },
          project: {
            id: 'number',
            name: 'string'
          },
          user: {
            id: 'number',
            name: 'string',
            email: 'string'
          },
          addedBy: {
            id: 'number',
            name: 'string',
            email: 'string'
          }
        }
      }
    ]
  }
}

// Helper pour envoyer facilement un webhook
export const sendWebhook = (eventType, eventData, userId) => {
  return WebhookService.sendWebhook(eventType, eventData, userId)
}

export default WebhookService 