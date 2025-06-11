# Guide de Dépannage - Production

## 🚨 Problème : Déconnexion automatique après actualisation en production

### Symptômes

- L'utilisateur se connecte correctement en production
- Les projets se chargent initialement
- Après actualisation de la page, l'utilisateur est déconnecté
- Le problème ne se produit pas en local

### Cause probable

**Configuration des cookies incorrecte en production HTTPS**

Les cookies d'authentification ne sont pas correctement configurés pour persister en production, notamment :

- Domaine non spécifié pour les sous-domaines
- Options de sécurité HTTPS mal configurées
- Path des cookies non défini

### Diagnostic

#### 1. Exécuter le script de diagnostic

```bash
node scripts/diagnose-production.js
```

Vérifiez particulièrement la section "Test de configuration des cookies".

#### 2. Vérifier les cookies dans le navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Application" > "Cookies"
3. Vérifiez que le cookie `token` est présent avec les bonnes options :
   - `Domain` : doit être `.votre-domaine.com` en production
   - `Path` : doit être `/`
   - `Secure` : doit être `true` en HTTPS
   - `SameSite` : doit être `Lax`

#### 3. Vérifier les logs du serveur

Recherchez ces messages dans les logs :

```
🍪 [AuthContext] Configuration du cookie: {...}
✅ [AuthContext] Utilisateur authentifié: {...}
❌ [AuthContext] Token invalide ou expiré
```

### Solutions appliquées

#### ✅ Solution 1 : Configuration des cookies améliorée

Le code a été mis à jour dans `src/contexts/AuthContext.js` pour :

1. **Détecter automatiquement l'environnement** (production vs développement)
2. **Configurer le domaine des cookies** pour les sous-domaines en production
3. **Appliquer les bonnes options de sécurité** selon le protocole (HTTP/HTTPS)

```javascript
// Configuration automatique des cookies
const cookieOptions = {
  expires: 7,
  secure: isHttps, // true en HTTPS
  sameSite: 'lax',
  path: '/',
  domain: isProduction ? '.votre-domaine.com' : undefined
};
```

#### ✅ Solution 2 : Gestion intelligente des erreurs

- **Erreurs 401** : Token invalide → Suppression du cookie et déconnexion
- **Erreurs 500/503** : Erreur serveur → Conservation du token
- **Erreurs réseau** : Problème temporaire → Conservation du token

#### ✅ Solution 3 : Suppression correcte des cookies

La fonction `logout()` utilise maintenant les mêmes options que lors de la création pour supprimer correctement les cookies.

### Vérification post-correction

#### 1. Redéployer l'application

```bash
npm run build
npm run start
```

#### 2. Tester le flux complet

1. Se connecter en production
2. Vérifier que les projets se chargent
3. Actualiser la page plusieurs fois
4. Vérifier que l'utilisateur reste connecté

#### 3. Vérifier les cookies

Dans les outils de développement, le cookie `token` doit avoir :

```
Name: token
Value: eyJ... (JWT token)
Domain: .chghosts.fr
Path: /
Secure: ✓ (en HTTPS)
HttpOnly: ✗
SameSite: Lax
```

### Monitoring continu

#### Logs à surveiller

```bash
# Connexions réussies
✅ [AuthContext] Connexion réussie, définition du cookie
🍪 [AuthContext] Configuration du cookie: {...}

# Vérifications d'authentification
✅ [AuthContext] Utilisateur authentifié: {...}
📡 [AuthContext] Réponse du serveur: { status: 200, ok: true }

# Erreurs à investiguer
❌ [AuthContext] Token invalide ou expiré
🌐 [AuthContext] Erreur réseau détectée
```

#### Métriques importantes

- Taux de déconnexions inattendues
- Erreurs 401 vs erreurs réseau
- Temps de réponse de l'API `/api/auth/me`

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
❌ [Auth Middleware] JWT_SECRET manquant dans les variables d'environnement
❌ [Projects API] Erreur de connexion à la base de données
❌ [Projects API] Erreur lors de la récupération des projets: {...}
```

## 🔧 Commandes de dépannage rapide

```bash
# Diagnostic complet
node scripts/diagnose-production.js

# Vérifier la base de données
npx prisma studio

# Nettoyer et reconstruire
rm -rf .next/ && npm run build

# Vérifier les logs en temps réel
tail -f logs/production.log

# Redémarrer les services
pm2 restart all
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Collecter les informations** :

   - Logs du serveur
   - Résultat du script de diagnostic
   - Configuration des cookies dans le navigateur

2. **Vérifier l'environnement** :

   - Variables d'environnement
   - Version de Node.js
   - Configuration du serveur web

3. **Tester en local** :
   - Le problème se reproduit-il en local ?
   - Différences entre local et production ?
