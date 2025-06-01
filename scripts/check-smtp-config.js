const nodemailer = require('nodemailer')

async function checkSMTPConfig() {
  console.log('🔍 Vérification de la configuration SMTP...\n')
  
  // Vérifier les variables d'environnement
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const missingVars = []
  
  console.log('📋 Variables d\'environnement SMTP:')
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`   ✅ ${varName}: ${varName === 'SMTP_PASS' ? '***' : value}`)
    } else {
      console.log(`   ❌ ${varName}: Non définie`)
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    console.log('\n❌ Variables manquantes:', missingVars.join(', '))
    console.log('\n💡 Pour configurer SMTP, ajoutez ces variables à votre fichier .env.local:')
    console.log('SMTP_HOST="smtp.gmail.com"')
    console.log('SMTP_PORT="465"')
    console.log('SMTP_USER="votre-email@gmail.com"')
    console.log('SMTP_PASS="votre-mot-de-passe-application"')
    console.log('\n📖 Consultez docs/EMAIL_TROUBLESHOOTING.md pour plus d\'informations')
    return
  }
  
  console.log('\n🧪 Test de connexion SMTP...')
  
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    
    // Vérifier la connexion
    await transporter.verify()
    console.log('✅ Connexion SMTP réussie!')
    
    // Test d'envoi d'email (optionnel)
    const testEmail = process.argv[2]
    if (testEmail) {
      console.log(`\n📧 Envoi d'un email de test à ${testEmail}...`)
      
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: testEmail,
        subject: '🧪 Test SMTP - CollabWave',
        html: `
          <h2>Test SMTP réussi ! ✅</h2>
          <p>Votre configuration SMTP fonctionne correctement.</p>
          <p>Timestamp: ${new Date().toLocaleString('fr-FR')}</p>
        `
      }
      
      await transporter.sendMail(mailOptions)
      console.log('✅ Email de test envoyé avec succès!')
    }
    
  } catch (error) {
    console.error('❌ Erreur SMTP:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Erreur d\'authentification. Vérifiez:')
      console.log('   - Votre email et mot de passe')
      console.log('   - Si vous utilisez Gmail, utilisez un mot de passe d\'application')
      console.log('   - Activez l\'authentification à 2 facteurs sur Gmail')
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Erreur de connexion. Vérifiez:')
      console.log('   - Votre connexion internet')
      console.log('   - Le host et port SMTP')
      console.log('   - Votre firewall')
    }
  }
}

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

checkSMTPConfig() 