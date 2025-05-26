import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Template de base pour tous les emails
const createEmailTemplate = (title, emoji, content, ctaButton = null) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - CollabWave</title>
      <style>
        /* Reset CSS pour les clients email */
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
        
        /* Styles pour les boutons CTA - meilleur centrage mobile */
        .cta-button {
          display: block !important;
          width: auto !important;
          max-width: 280px !important;
          margin: 0 auto !important;
          text-align: center !important;
          text-decoration: none !important;
          color: white !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          padding: 18px 30px !important;
          border-radius: 50px !important;
          line-height: 1.2 !important;
          vertical-align: middle !important;
          box-sizing: border-box !important;
        }
        
        /* Media queries pour mobile */
        @media only screen and (max-width: 600px) {
          .cta-button {
            font-size: 14px !important;
            padding: 16px 25px !important;
            max-width: 250px !important;
          }
          .mobile-padding {
            padding: 20px 15px !important;
          }
          .mobile-text {
            font-size: 14px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; width: 100% !important; height: 100% !important;">
      
      <!-- Container principal avec table pour compatibilité -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <tr>
          <td align="center" valign="top" style="padding: 40px 20px;" class="mobile-padding">
            
            <!-- Boîte principale -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background: white; border-radius: 20px; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15); max-width: 600px; width: 100%; overflow: hidden;">
              
              <!-- Header avec gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;" class="mobile-padding">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center; line-height: 80px;">
                          <span style="font-size: 40px; vertical-align: middle;">${emoji}</span>
                        </div>
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); line-height: 1.2;">
                          ${title}
                        </h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px; font-weight: 400; line-height: 1.4;" class="mobile-text">
                          CollabWave - Votre plateforme de collaboration
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Contenu principal -->
              <tr>
                <td style="padding: 40px 30px;" class="mobile-padding">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;" class="mobile-padding">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <div style="margin-bottom: 20px;">
                          <h3 style="color: #374151; margin: 0 0 10px; font-size: 18px; font-weight: 600;">
                            CollabWave
                          </h3>
                          <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.4;" class="mobile-text">
                            La plateforme de collaboration qui transforme vos idées en réalité
                          </p>
                        </div>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
                            Vous recevez cet email car vous utilisez CollabWave.<br>
                            Si vous avez des questions, n'hésitez pas à nous contacter.
                          </p>
                          <p style="color: #9ca3af; margin: 15px 0 0; font-size: 12px;">
                            © 2024 CollabWave. Tous droits réservés.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
            
          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `
}

export const sendVerificationEmail = async (to, token) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationLink = `${baseUrl}/auth/verify?token=${token}`
  
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 15px; font-size: 24px; font-weight: 600; line-height: 1.3;">
            Plus qu'une étape ! ✨
          </h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6; text-align: center;" class="mobile-text">
            Nous sommes ravis de vous accueillir dans la communauté CollabWave.<br>
            Cliquez sur le bouton ci-dessous pour activer votre compte et commencer à collaborer.
          </p>
        </td>
      </tr>

      <!-- Bouton CTA principal -->
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);">
                <a href="${verificationLink}" class="cta-button" style="display: block; width: auto; max-width: 280px; margin: 0 auto; text-align: center; text-decoration: none; color: white; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 18px 30px; border-radius: 50px; line-height: 1.2; vertical-align: middle; box-sizing: border-box;">
                  🔓 Activer mon compte
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Informations supplémentaires -->
      <tr>
        <td style="padding: 30px 0;">
          <div style="background: #f8fafc; border-radius: 15px; padding: 25px; border-left: 4px solid #667eea;">
            <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="margin-right: 10px;">💡</span>
              Que pouvez-vous faire avec CollabWave ?
            </h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Créer et gérer des projets collaboratifs</li>
              <li>Organiser vos tâches avec des catégories personnalisées</li>
              <li>Inviter des collaborateurs et travailler en équipe</li>
              <li>Suivre l'avancement en temps réel</li>
            </ul>
          </div>
        </td>
      </tr>

      <!-- Lien de secours -->
      <tr>
        <td style="padding: 25px 0;">
          <div style="background: #fef3c7; border-radius: 10px; padding: 20px; border: 1px solid #fbbf24;">
            <p style="color: #92400e; margin: 0 0 10px; font-size: 14px; font-weight: 600;">
              ⚠️ Le bouton ne fonctionne pas ?
            </p>
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;" class="mobile-text">
              Copiez et collez ce lien dans votre navigateur :
            </p>
            <div style="background: white; border-radius: 8px; padding: 12px; margin-top: 10px; border: 1px solid #fbbf24;">
              <code style="color: #1f2937; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                ${verificationLink}
              </code>
            </div>
          </div>
        </td>
      </tr>

      <!-- Informations de sécurité -->
      <tr>
        <td style="padding: 25px 0 0;">
          <div style="background: #ecfdf5; border-radius: 10px; padding: 20px; border: 1px solid #10b981;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 40px; vertical-align: top; padding-right: 15px;">
                  <div style="font-size: 20px;">🔒</div>
                </td>
                <td style="vertical-align: top;">
                  <h4 style="color: #065f46; margin: 0 0 8px; font-size: 16px; font-weight: 600;">
                    Sécurité et confidentialité
                  </h4>
                  <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.5;" class="mobile-text">
                    Ce lien est sécurisé et expire automatiquement dans <strong>24 heures</strong>. 
                    Vos données sont protégées selon les standards de sécurité les plus élevés.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  `
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: '🚀 Activez votre compte CollabWave - Dernière étape !',
    html: createEmailTemplate('Bienvenue sur CollabWave !', '🚀', content)
  }

  await transporter.sendMail(mailOptions)
}

// Fonction pour envoyer des emails d'invitation de projet
export const sendProjectInvitationEmail = async (to, projectName, inviterName, invitationLink) => {
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0 0 15px; font-size: 24px; font-weight: 600; line-height: 1.3;">
            Nouvelle invitation de collaboration ! 🎉
          </h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.6; text-align: center;" class="mobile-text">
            <strong>${inviterName}</strong> vous invite à collaborer sur le projet<br>
            <strong style="color: #667eea;">"${projectName}"</strong>
          </p>
        </td>
      </tr>

      <!-- Bouton CTA principal -->
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                <a href="${invitationLink}" class="cta-button" style="display: block; width: auto; max-width: 280px; margin: 0 auto; text-align: center; text-decoration: none; color: white; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 18px 30px; border-radius: 50px; line-height: 1.2; vertical-align: middle; box-sizing: border-box;">
                  🤝 Rejoindre le projet
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Informations sur la collaboration -->
      <tr>
        <td style="padding: 30px 0;">
          <div style="background: #f0f9ff; border-radius: 15px; padding: 25px; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              <span style="margin-right: 10px;">🚀</span>
              Commencez à collaborer dès maintenant
            </h3>
            <p style="color: #0369a1; margin: 0; font-size: 14px; line-height: 1.6;" class="mobile-text">
              Une fois que vous aurez rejoint le projet, vous pourrez créer des tâches, 
              suivre l'avancement et collaborer en temps réel avec l'équipe.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: `🤝 ${inviterName} vous invite à collaborer sur "${projectName}"`,
    html: createEmailTemplate('Invitation de collaboration', '🤝', content)
  }

  await transporter.sendMail(mailOptions)
} 