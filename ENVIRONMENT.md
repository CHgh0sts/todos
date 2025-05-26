# Variables d'environnement - CollabWave

Ce document liste toutes les variables d'environnement nécessaires pour faire fonctionner CollabWave en développement et en production.

## Variables obligatoires

### Base de données

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/collabwave"
```

URL de connexion à la base de données PostgreSQL.

### Authentification

```bash
JWT_SECRET="votre-secret-jwt-tres-long-et-securise"
```

Clé secrète pour signer les tokens JWT. **DOIT** être différente entre développement et production.

### Configuration SMTP (Email)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-application"
```

**Configuration recommandée par fournisseur :**

#### Gmail

- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `465`
- `SMTP_USER`: Votre adresse Gmail
- `SMTP_PASS`: Mot de passe d'application (pas votre mot de passe Gmail)

#### Outlook/Hotmail

- `SMTP_HOST`: `smtp-mail.outlook.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: Votre adresse Outlook
- `SMTP_PASS`: Votre mot de passe Outlook

#### SendGrid

- `SMTP_HOST`: `smtp.sendgrid.net`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `apikey`
- `SMTP_PASS`: Votre clé API SendGrid

## Variables optionnelles

### Configuration serveur

```bash
NODE_ENV="production"          # development | production
PORT="3000"                    # Port du serveur
HOSTNAME="0.0.0.0"            # Hostname (0.0.0.0 pour production)
```

### URL de l'application

```bash
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"
```

URL publique de votre application. Utilisée pour :

- Les liens dans les emails
- La configuration CORS des sockets
- Les redirections

### Variables Vercel (automatiques)

Ces variables sont automatiquement définies par Vercel :

```bash
VERCEL_URL                     # URL automatique Vercel
VERCEL_ENV                     # Environnement Vercel
```

## Configuration par environnement

### Développement (.env.local)

```bash
# Base de données locale
DATABASE_URL="postgresql://postgres:password@localhost:5432/collabwave_dev"

# JWT Secret (différent de la production)
JWT_SECRET="dev-secret-key-change-me-in-production"

# SMTP (optionnel en dev, peut utiliser un service de test)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="dev@example.com"
SMTP_PASS="dev-password"

# URL locale
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production

```bash
# Base de données production (ex: Supabase, Railway, etc.)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT Secret sécurisé
JWT_SECRET="production-super-secure-secret-key-minimum-32-characters"

# SMTP production
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="noreply@votre-domaine.com"
SMTP_PASS="mot-de-passe-application-securise"

# URL production
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"

# Configuration serveur
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
```

## Vérification des variables

Le script `start-production.sh` vérifie automatiquement que les variables essentielles sont définies :

- `DATABASE_URL`
- `JWT_SECRET`

## Sécurité

⚠️ **Important** :

- Ne jamais commiter les fichiers `.env*` dans Git
- Utiliser des mots de passe d'application pour Gmail (pas votre mot de passe principal)
- Générer un JWT_SECRET différent pour chaque environnement
- Utiliser HTTPS en production

## Dépannage SMTP

Si les emails ne sont pas envoyés :

1. **Vérifiez les logs** : Les erreurs SMTP sont loggées dans la console
2. **Gmail** : Activez l'authentification à 2 facteurs et générez un mot de passe d'application
3. **Firewall** : Vérifiez que le port SMTP n'est pas bloqué
4. **Test** : Utilisez un service comme Mailtrap pour tester en développement

### Test de configuration SMTP

```bash
# Vérifier que les variables sont définies
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
echo $SMTP_PASS
```

## Support

En cas de problème avec la configuration :

1. Vérifiez que toutes les variables obligatoires sont définies
2. Consultez les logs du serveur pour les erreurs détaillées
3. Testez la configuration SMTP avec un outil externe
