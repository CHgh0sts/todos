# Dépannage des emails - CollabWave

Ce guide vous aide à résoudre les problèmes d'envoi d'emails dans CollabWave.

## Problèmes courants

### 1. "Erreur lors de la création du compte" mais le compte est créé

**Symptômes :**

- L'inscription affiche une erreur
- Le compte est créé en base de données
- Aucun email de vérification reçu

**Cause :** Configuration SMTP manquante ou incorrecte

**Solution :**

1. Vérifiez vos variables d'environnement SMTP
2. Testez votre configuration avec : `npm run test:email votre@email.com`
3. Consultez les logs du serveur pour les détails de l'erreur

### 2. Variables SMTP manquantes

**Erreur :** `SMTP_HOST n'est pas définie`

**Solution :** Ajoutez ces variables à votre fichier `.env.local` :

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-application"
```

### 3. Erreur d'authentification Gmail

**Erreur :** `Invalid login: 535-5.7.8 Username and Password not accepted`

**Solution :**

1. Activez l'authentification à 2 facteurs sur votre compte Gmail
2. Générez un mot de passe d'application :
   - Allez dans les paramètres Google
   - Sécurité → Authentification à 2 facteurs → Mots de passe des applications
   - Générez un nouveau mot de passe pour "Autre (nom personnalisé)"
   - Utilisez ce mot de passe dans `SMTP_PASS`

### 4. Port bloqué

**Erreur :** `ECONNECTION` ou timeout

**Solutions :**

- Essayez le port 587 au lieu de 465
- Vérifiez votre firewall
- Testez depuis un autre réseau

### 5. Emails en spam

**Problème :** Les emails arrivent dans le dossier spam

**Solutions :**

- Configurez SPF, DKIM et DMARC pour votre domaine
- Utilisez un service SMTP professionnel (SendGrid, Mailgun)
- Ajoutez l'adresse d'expédition aux contacts

## Configuration par fournisseur

### Gmail

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="mot-de-passe-application"
```

### Outlook/Hotmail

```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="votre-email@outlook.com"
SMTP_PASS="votre-mot-de-passe"
```

### SendGrid (recommandé pour la production)

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="votre-cle-api-sendgrid"
```

### Mailtrap (pour les tests)

```bash
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="votre-username-mailtrap"
SMTP_PASS="votre-password-mailtrap"
```

## Tests et diagnostic

### Test rapide

```bash
npm run test:email votre@email.com
```

### Test manuel avec Node.js

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'votre-email@gmail.com',
    pass: 'votre-mot-de-passe-application'
  }
});

transporter.verify(console.log);
```

### Vérification des logs

En développement, les erreurs SMTP sont affichées dans la console :

```bash
npm run dev
# Tentez une inscription et observez les logs
```

En production, consultez les logs de votre hébergeur.

## Solutions par environnement

### Développement

- Utilisez Mailtrap ou un service de test
- Les erreurs SMTP ne bloquent pas l'inscription
- Testez avec `npm run test:email`

### Production

- Utilisez un service SMTP professionnel
- Configurez les DNS (SPF, DKIM, DMARC)
- Surveillez les logs d'erreur
- Testez régulièrement l'envoi d'emails

## Alternatives sans SMTP

Si vous ne pouvez pas configurer SMTP, vous pouvez :

1. **Désactiver temporairement la vérification email** (non recommandé) :
   - Modifiez la route d'inscription pour créer des comptes déjà vérifiés
2. **Utiliser un service tiers** :

   - Intégrez un service comme Resend, Postmark, ou AWS SES

3. **Vérification manuelle** :
   - Créez un script admin pour vérifier les comptes manuellement

## Support

Si vous rencontrez toujours des problèmes :

1. Exécutez `npm run test:email` et partagez les résultats
2. Vérifiez les logs du serveur
3. Testez avec un autre fournisseur SMTP
4. Consultez la documentation de votre fournisseur SMTP

## Checklist de dépannage

- [ ] Variables SMTP définies dans `.env.local`
- [ ] Test de connexion SMTP réussi
- [ ] Mot de passe d'application généré (Gmail)
- [ ] Port non bloqué par le firewall
- [ ] Logs du serveur consultés
- [ ] Test avec un autre email
- [ ] Vérification du dossier spam
