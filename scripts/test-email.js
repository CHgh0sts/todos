#!/usr/bin/env node

/**
 * Script de test pour la configuration SMTP
 * Usage: node scripts/test-email.js [email-destinataire]
 */

require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

const testEmail = process.argv[2] || 'test@example.com'

console.log('🧪 Test de configuration SMTP pour CollabWave\n')

// Vérifier les variables d'environnement
console.log('📋 Vérification des variables d\'environnement:')
const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
const missingVars = []

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'SMTP_PASS' ? '***' : value}`)
  } else {
    console.log(`❌ ${varName}: Non définie`)
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.log(`\n❌ Variables manquantes: ${missingVars.join(', ')}`)
  console.log('Veuillez configurer ces variables dans votre fichier .env.local')
  process.exit(1)
}

// Créer le transporteur
console.log('\n🔧 Configuration du transporteur SMTP...')
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Test de connexion
console.log('🔌 Test de connexion SMTP...')
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erreur de connexion SMTP:')
    console.log(error.message)
    
    // Suggestions d'erreurs communes
    if (error.code === 'EAUTH') {
      console.log('\n💡 Suggestions:')
      console.log('- Vérifiez vos identifiants SMTP')
      console.log('- Pour Gmail: utilisez un mot de passe d\'application')
      console.log('- Activez l\'authentification à 2 facteurs si nécessaire')
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Suggestions:')
      console.log('- Vérifiez votre connexion internet')
      console.log('- Vérifiez que le port SMTP n\'est pas bloqué')
      console.log('- Essayez un autre port (587 au lieu de 465)')
    }
    
    process.exit(1)
  } else {
    console.log('✅ Connexion SMTP réussie!')
    
    // Envoyer un email de test
    console.log(`\n📧 Envoi d'un email de test à: ${testEmail}`)
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: testEmail,
      subject: '🧪 Test SMTP - CollabWave',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Test SMTP réussi ! 🎉</h2>
          <p>Félicitations ! Votre configuration SMTP fonctionne correctement.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration utilisée:</h3>
            <ul>
              <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>User:</strong> ${process.env.SMTP_USER}</li>
            </ul>
          </div>
          <p>Vous pouvez maintenant utiliser CollabWave avec l'envoi d'emails activé.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Cet email a été envoyé par le script de test SMTP de CollabWave.
          </p>
        </div>
      `
    }
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Erreur lors de l\'envoi de l\'email:')
        console.log(error.message)
        process.exit(1)
      } else {
        console.log('✅ Email de test envoyé avec succès!')
        console.log(`📬 Message ID: ${info.messageId}`)
        console.log('\n🎉 Configuration SMTP entièrement fonctionnelle!')
        console.log('\nVous pouvez maintenant utiliser CollabWave avec l\'envoi d\'emails.')
      }
    })
  }
}) 