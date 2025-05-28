# Guide de Dépannage - Production

## 🚨 Problème : Erreur lors de la récupération des projets

### Symptômes

- La page `/projects` ne charge pas les projets
- Erreur dans la console : "Erreur lors du chargement des projets"
- L'API `/api/projects` retourne une erreur 500

### Diagnostic

#### 1. Exécuter le script de diagnostic

```bash
npm run diagnose
```

#### 2. Vérifier les logs du serveur

Les logs détaillés sont maintenant activés. Recherchez :

- `🔍 [Projects API] Début de la récupération des projets`
- `❌ [Projects API] Erreur lors de la récupération des projets`
- `❌ [Auth Middleware] Erreur d'authentification`

#### 3. Vérifier les variables d'environnement

```bash
# Variables requises en production :
DATABASE_URL=postgresql://...
JWT_SECRET=votre-secret-jwt
NEXTAUTH_SECRET=votre-secret-nextauth
NEXTAUTH_URL=https://votre-domaine.com
NODE_ENV=production
```

### Solutions possibles

#### Solution 1 : Problème de base de données

```bash
# Vérifier la connexion
npx prisma db push

# Régénérer le client Prisma
npx prisma generate

# Redémarrer l'application
npm run start
```

#### Solution 2 : Problème d'authentification

```bash
# Vérifier que JWT_SECRET est défini
echo $JWT_SECRET

# Si vide, définir la variable
export JWT_SECRET="votre-secret-jwt-securise"
```

#### Solution 3 : Problème de permissions

```bash
# Vérifier les permissions des fichiers
ls -la .next/
ls -la prisma/

# Corriger si nécessaire
chmod -R 755 .next/
chmod -R 755 prisma/
```

#### Solution 4 : Problème de cache

```bash
# Nettoyer le cache Next.js
rm -rf .next/
npm run build
npm run start
```

### Logs à surveiller

#### Logs normaux (succès)

```
✅ [Auth Middleware] Utilisateur authentifié: { userId: "...", userName: "..." }
✅ [Projects API] Connexion à la base de données établie
✅ [Projects API] Projets récupérés: { count: 5 }
```

#### Logs d'erreur (problème)

```
❌ [Auth Middleware] Token manquant ou format incorrect
❌ [Projects API] Erreur de connexion à la base de données
❌ [Projects API] Erreur lors de la récupération des projets
```

### Tests manuels

#### 1. Tester l'API directement

```bash
# Récupérer un token depuis les cookies du navigateur
curl -H "Authorization: Bearer VOTRE_TOKEN" \
     -H "Content-Type: application/json" \
     https://votre-domaine.com/api/projects
```

#### 2. Tester la base de données

```bash
# Se connecter à la base
npx prisma studio

# Ou via psql
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

#### 3. Tester l'authentification

```bash
# Vérifier qu'un utilisateur existe
npx prisma studio
# Aller dans la table User et vérifier qu'il y a des utilisateurs
```

### Checklist de déploiement

- [ ] Variables d'environnement définies
- [ ] Base de données accessible
- [ ] Migrations Prisma appliquées
- [ ] Client Prisma généré
- [ ] Application buildée (`npm run build`)
- [ ] Permissions de fichiers correctes
- [ ] Logs activés

### Commandes utiles

```bash
# Diagnostic complet
npm run diagnose

# Vérifier la configuration Prisma
npx prisma validate

# Voir le schéma de la base
npx prisma db pull

# Appliquer les migrations
npx prisma db push

# Régénérer le client
npx prisma generate

# Redémarrer en production
npm run start
```

### Contacts d'urgence

En cas de problème critique :

1. Vérifier les logs du serveur
2. Exécuter `npm run diagnose`
3. Redémarrer l'application
4. Vérifier la base de données

### Monitoring

Pour surveiller l'application en continu :

- Logs du serveur : `tail -f logs/app.log`
- Métriques de la base : via Prisma Studio
- Statut de l'API : `curl https://votre-domaine.com/api/health`
