# 🔧 Système de Maintenance - CollabWave

## Vue d'ensemble

Le système de maintenance de CollabWave permet aux administrateurs de mettre temporairement le site en mode maintenance, bloquant l'accès aux utilisateurs non-administrateurs tout en permettant aux admins de continuer à gérer le système.

## Architecture

### 1. **Base de données**

```sql
-- Table system_settings
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  value VARCHAR NOT NULL,
  description VARCHAR,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Paramètres clés :**

- `maintenanceMode`: `'true'` ou `'false'`
- `maintenanceMessage`: Message affiché aux utilisateurs

### 2. **APIs**

#### `/api/maintenance-status` (GET)

- **Public** - Accessible à tous
- Retourne l'état du mode maintenance
- Utilisé par le HOC pour vérifier l'état

#### `/api/admin/settings` (GET/PUT)

- **Admin uniquement**
- Gestion des paramètres système
- Invalidation automatique du cache

#### `/api/admin/maintenance` (POST)

- **Admin uniquement**
- Actions de maintenance (clear cache, optimize DB, etc.)

### 3. **HOC (Higher Order Component)**

Le fichier `src/lib/withMaintenanceCheck.js` contient un HOC qui :

- Vérifie automatiquement le mode maintenance
- Redirige les non-admins vers `/maintenance`
- Affiche un spinner pendant la vérification
- Permet aux admins de continuer normalement

### 4. **Pages protégées**

Les pages suivantes utilisent le HOC :

- `/` (page d'accueil)
- `/projects` (liste des projets)
- Toutes les autres pages utilisateur

### 5. **Pages exemptées**

Ces pages restent accessibles même en mode maintenance :

- `/admin/*` (toutes les pages d'administration)
- `/auth/login` (connexion)
- `/api/auth/*` (APIs d'authentification)
- `/maintenance` (page de maintenance)

## Utilisation

### Activer le mode maintenance

1. **Via l'interface admin :**

   - Aller sur `/admin/settings`
   - Onglet "Général"
   - Activer "Mode Maintenance"
   - Personnaliser le message si nécessaire
   - Cliquer "Valider"

2. **Via la base de données :**

   ```sql
   UPDATE system_settings
   SET value = 'true'
   WHERE key = 'maintenanceMode';
   ```

3. **Via script Node.js :**
   ```bash
   node -e "
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   prisma.systemSettings.update({
     where: { key: 'maintenanceMode' },
     data: { value: 'true' }
   }).then(() => console.log('Maintenance activée'));
   "
   ```

### Désactiver le mode maintenance

Même méthodes que l'activation, mais avec `value = 'false'`

### Tester le système

```bash
npm run test-maintenance
```

Ce script vérifie :

- L'état actuel des paramètres
- Le fonctionnement de l'API
- L'accès aux pages
- Les statistiques de la base

## Comportement

### Pour les utilisateurs non-admin

1. **Accès à une page protégée** → Vérification automatique
2. **Mode maintenance activé** → Redirection vers `/maintenance`
3. **Page de maintenance** → Affichage du message personnalisé
4. **Vérification périodique** → Redirection automatique quand désactivé

### Pour les administrateurs

1. **Accès normal** à toutes les pages
2. **Badge spécial** dans l'interface indiquant le mode maintenance
3. **Gestion complète** via `/admin/settings`
4. **Actions de maintenance** disponibles

## Cache et Performance

### Cache de maintenance

- **Durée :** 30 secondes
- **Invalidation :** Automatique lors des mises à jour
- **Fonction :** `invalidateMaintenanceCache()`

### Optimisations

- Vérification côté client uniquement
- Cache pour éviter les requêtes répétées
- Chargement asynchrone des vérifications

## Sécurité

### Contrôles d'accès

- **Vérification du rôle** : Seuls les ADMIN peuvent gérer
- **Validation des tokens** : JWT requis pour les APIs admin
- **Logging complet** : Toutes les actions sont enregistrées

### Routes protégées

```javascript
const exemptRoutes = ['/api/admin/settings', '/api/admin/maintenance', '/admin', '/auth/login', '/maintenance'];
```

## Logging et Monitoring

### Actions loggées

- Activation/désactivation du mode maintenance
- Modification du message de maintenance
- Actions de maintenance (clear cache, etc.)
- Tentatives d'accès pendant la maintenance

### Informations enregistrées

- **Utilisateur** : ID et rôle
- **Action** : Type d'action effectuée
- **Détails** : Paramètres modifiés
- **Contexte** : IP, User Agent, timestamp

## Dépannage

### Problèmes courants

1. **Le mode maintenance ne fonctionne pas**

   ```bash
   # Vérifier l'état
   npm run test-maintenance

   # Vérifier la base de données
   npx prisma studio
   ```

2. **Les admins sont bloqués**

   ```bash
   # Désactiver via la base
   node -e "/* script de désactivation */"
   ```

3. **Cache bloqué**
   ```bash
   # Redémarrer le serveur
   npm run dev
   ```

### Logs utiles

```bash
# Logs du serveur
tail -f logs/server.log

# Logs de maintenance
grep "maintenance" logs/server.log
```

## Scripts utiles

```bash
# Test complet du système
npm run test-maintenance

# Activer la maintenance
node -e "/* script activation */"

# Désactiver la maintenance
node -e "/* script désactivation */"

# Vérifier l'état
curl http://localhost:3000/api/maintenance-status
```

## Bonnes pratiques

### Avant la maintenance

1. **Prévenir les utilisateurs** via notifications
2. **Planifier pendant les heures creuses**
3. **Préparer un message informatif**
4. **Tester le système** en mode développement

### Pendant la maintenance

1. **Surveiller les logs** d'erreur
2. **Effectuer les tâches rapidement**
3. **Tester les fonctionnalités** critiques
4. **Communiquer** sur l'avancement

### Après la maintenance

1. **Désactiver le mode** maintenance
2. **Vérifier le fonctionnement** normal
3. **Surveiller les performances**
4. **Informer les utilisateurs** de la fin

## Intégration avec d'autres systèmes

### Notifications

Le système peut être étendu pour :

- Envoyer des emails automatiques
- Publier sur les réseaux sociaux
- Mettre à jour les pages de statut externes

### Monitoring

Compatible avec :

- Prometheus/Grafana
- DataDog
- New Relic
- Sentry

---

**Note :** Ce système est conçu pour être simple, fiable et sécurisé. Pour des besoins plus complexes, considérez l'utilisation d'un load balancer ou d'un reverse proxy.
