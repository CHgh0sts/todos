# 🚀 Guide de Démarrage Local - CollabWave

## 🎯 Démarrage Rapide

### 1. Démarrer l'application

```bash
# Option 1: Script automatique (recommandé)
./start-dev.sh

# Option 2: Commande manuelle
export $(cat .env.local | xargs) && npm run dev
```

### 2. Accéder à l'application

- **Interface web** : http://localhost:3000
- **Health check** : http://localhost:3000/api/health
- **Page de connexion** : http://localhost:3000/auth/login

## 🔧 Configuration Actuelle

### Variables d'environnement (`.env.local`)

```bash
DATABASE_URL="postgres://...@147.79.101.194:7879/postgres?connection_limit=3&pool_timeout=10"
JWT_SECRET="dev-jwt-secret-local-development-only"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Caractéristiques

- ✅ **Base de données** : Partagée avec production (pool limité à 3 connexions)
- ✅ **JWT** : Secret séparé pour la sécurité
- ✅ **Environnement** : Développement
- ✅ **URL** : Locale (localhost:3000)

## 🛠️ Commandes Utiles

```bash
# Tester la configuration locale
npm run test:local

# Diagnostiquer les problèmes
npm run diagnose:503

# Arrêter le serveur
pkill -f "node server.js"

# Vérifier le statut
curl http://localhost:3000/api/health
```

## 🔍 Dépannage

### Problème : "Port 3000 déjà utilisé"

```bash
# Trouver le processus qui utilise le port
lsof -ti:3000

# L'arrêter
kill -9 $(lsof -ti:3000)

# Ou utiliser le script qui le fait automatiquement
./start-dev.sh
```

### Problème : "Can't reach database server"

```bash
# Vérifier les variables d'environnement
cat .env.local

# Tester la connexion
npm run test:local

# Recharger les variables
export $(cat .env.local | xargs)
```

### Problème : "JWT_SECRET manquant"

```bash
# Vérifier que .env.local contient JWT_SECRET
grep JWT_SECRET .env.local

# Si manquant, recréer le fichier
echo 'JWT_SECRET="dev-jwt-secret-local-development-only"' >> .env.local
```

## 📊 Comptes de Test

Après avoir démarré l'application, vous pouvez utiliser ces comptes :

```bash
# Compte administrateur
Email: admin@example.com
Mot de passe: [voir base de données]

# Compte utilisateur
Email: user@example.com
Mot de passe: [voir base de données]
```

## 🎯 Différences Dev vs Production

| Aspect          | Développement           | Production                 |
| --------------- | ----------------------- | -------------------------- |
| Base de données | Partagée (3 connexions) | Dédiée (20 connexions)     |
| JWT Secret      | `dev-jwt-secret-...`    | Secret sécurisé            |
| URL             | `http://localhost:3000` | `https://todo.chghosts.fr` |
| Logs            | Détaillés               | Erreurs uniquement         |
| Cache           | Désactivé               | Activé                     |

## 🚀 Prochaines Améliorations

### 1. Base de données locale dédiée

```bash
# Option Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Puis modifier .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/todos_dev"
```

### 2. Données de test

```bash
# Créer des données de test
npm run db:seed
```

### 3. Hot reload optimisé

```bash
# Surveiller les changements
npm run dev:watch
```

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** dans la console
2. **Testez la configuration** : `npm run test:local`
3. **Consultez le health check** : http://localhost:3000/api/health
4. **Redémarrez proprement** : `./start-dev.sh`

---

**✅ Votre environnement de développement est maintenant configuré et sécurisé !**
