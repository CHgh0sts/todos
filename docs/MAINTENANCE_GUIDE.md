# Guide du Système de Maintenance

## 📋 Vue d'ensemble

Le système de maintenance de CollabWave offre 6 actions principales pour maintenir et optimiser la plateforme. Toutes les actions sont sécurisées et nécessitent des privilèges d'administrateur.

## 🔧 Actions de Maintenance Disponibles

### 1. 🧹 Vider le Cache

**Action :** `clear-cache`

**Description :** Nettoie tous les caches système pour libérer de l'espace et forcer le rechargement des données.

**Fonctionnalités :**

- Vide le cache Next.js
- Nettoie le cache API
- Supprime les images en cache
- Libère l'espace disque

**Résultats affichés :**

- Types de cache nettoyés
- Espace libéré (en MB)
- Temps d'exécution

**Utilisation recommandée :** Après des mises à jour importantes ou en cas de problèmes de performance.

### 2. 🗃️ Optimiser la Base de Données

**Action :** `optimize-db`

**Description :** Optimise les performances de la base de données PostgreSQL.

**Fonctionnalités :**

- Analyse des tables avec `ANALYZE`
- Mise à jour des statistiques
- Optimisation des index
- Récupération des métriques

**Résultats affichés :**

- Nombre d'utilisateurs
- Nombre de projets
- Nombre de tâches
- Optimisations appliquées

**Utilisation recommandée :** Hebdomadaire ou après des modifications importantes de données.

### 3. 📝 Nettoyer les Logs Anciens

**Action :** `cleanup-logs`

**Description :** Supprime les anciens logs pour libérer de l'espace disque.

**Fonctionnalités :**

- Supprime les logs d'activité > 90 jours
- Supprime les logs API > 30 jours
- Calcule l'espace libéré
- Préserve les logs récents

**Résultats affichés :**

- Nombre de logs d'activité supprimés
- Nombre de logs API supprimés
- Espace disque libéré

**Utilisation recommandée :** Mensuelle ou quand l'espace disque devient critique.

### 4. 🔄 Redémarrer les Services

**Action :** `restart-services`

**Description :** Redémarre les services système pour résoudre les problèmes de performance.

**Fonctionnalités :**

- Redémarre l'API Server
- Redémarre Socket.IO
- Redémarre les tâches en arrière-plan
- Mesure le temps de redémarrage

**Résultats affichés :**

- Liste des services redémarrés
- Temps total de redémarrage
- Statut de chaque service

**Utilisation recommandée :** En cas de problèmes de connectivité ou de performance.

### 5. 🏥 Vérifier la Santé du Système

**Action :** `check-health`

**Description :** Effectue un diagnostic complet de la santé du système.

**Fonctionnalités :**

- Teste la connexion à la base de données
- Vérifie l'utilisation mémoire
- Calcule l'uptime
- Compte les utilisateurs actifs

**Résultats affichés :**

- État de la base de données
- Métriques mémoire
- Temps de fonctionnement
- Utilisateurs actifs (24h)

**Utilisation recommandée :** Quotidienne ou avant des opérations critiques.

### 6. 🔍 Mettre à Jour l'Index de Recherche

**Action :** `update-search-index`

**Description :** Reconstruit l'index de recherche pour améliorer les performances de recherche.

**Fonctionnalités :**

- Réindexe tous les projets
- Réindexe toutes les tâches
- Optimise les requêtes de recherche
- Mesure le temps d'indexation

**Résultats affichés :**

- Nombre de projets indexés
- Nombre de tâches indexées
- Temps d'indexation

**Utilisation recommandée :** Après l'ajout de nombreuses données ou en cas de problèmes de recherche.

### 7. 💾 Sauvegarde Complète

**Action :** `full-backup`

**Description :** Crée une sauvegarde complète de toutes les données système.

**Fonctionnalités :**

- Sauvegarde tous les utilisateurs
- Sauvegarde tous les projets
- Sauvegarde toutes les tâches
- Sauvegarde toutes les catégories
- Génère un ID unique de sauvegarde

**Résultats affichés :**

- ID de la sauvegarde
- Taille du fichier
- Emplacement de stockage
- Détail des données sauvegardées

**Utilisation recommandée :** Avant des mises à jour majeures ou quotidiennement en production.

## 🚀 Comment utiliser

### Interface Web

1. **Connexion :** Connectez-vous en tant qu'administrateur
2. **Navigation :** Allez sur `/admin/settings`
3. **Onglet :** Cliquez sur l'onglet "Maintenance"
4. **Exécution :** Cliquez sur le bouton de l'action souhaitée
5. **Suivi :** Observez l'indicateur de progression
6. **Résultats :** Consultez les résultats détaillés

### Indicateurs Visuels

- **🔵 Bouton normal :** Action prête à être exécutée
- **🟡 Bouton en cours :** Action en cours d'exécution avec spinner
- **🟢 Résultat affiché :** Action terminée avec succès
- **🔴 Erreur :** Action échouée avec message d'erreur

### États des Boutons

```javascript
// État normal
<button className="bg-blue-600 hover:bg-blue-700">
  Vider le Cache
</button>

// État en cours
<button disabled className="opacity-50 cursor-not-allowed">
  <spinner /> Nettoyage en cours...
</button>

// État désactivé (pendant une autre action)
<button disabled className="opacity-50">
  Vider le Cache
</button>
```

## 🔒 Sécurité

### Authentification Requise

Toutes les actions nécessitent :

- ✅ Utilisateur connecté
- ✅ Rôle `ADMIN`
- ✅ Token JWT valide
- ✅ Session active

### Logs d'Activité

Chaque action est automatiquement loggée :

- Utilisateur qui a exécuté l'action
- Timestamp d'exécution
- Résultat de l'action
- Adresse IP et User-Agent

### Protection CSRF

- Tokens CSRF validés
- Headers de sécurité requis
- Validation des paramètres

## 📊 Monitoring

### Métriques Collectées

Chaque action collecte :

- **Temps d'exécution** (en millisecondes)
- **Résultat** (succès/échec)
- **Détails spécifiques** selon l'action
- **Impact système** (espace libéré, éléments traités)

### Alertes Automatiques

Le système peut alerter en cas de :

- Échec répété d'une action
- Temps d'exécution anormalement long
- Erreurs critiques détectées

## 🧪 Tests

### Script de Test Automatique

```bash
# Tester toutes les actions (sans authentification)
npm run test-maintenance

# Résultat attendu : API accessible, authentification requise
```

### Test Manuel

1. **Prérequis :**

   - Serveur démarré (`npm run dev`)
   - Compte administrateur créé
   - Connexion établie

2. **Procédure :**

   - Tester chaque action individuellement
   - Vérifier les résultats affichés
   - Confirmer les logs d'activité

3. **Validation :**
   - Actions exécutées sans erreur
   - Résultats cohérents affichés
   - Logs créés correctement

## 🔧 Configuration

### Paramètres Modifiables

```javascript
// Dans /api/admin/maintenance/route.js

// Durée de rétention des logs
const ACTIVITY_LOG_RETENTION_DAYS = 90;
const API_LOG_RETENTION_DAYS = 30;

// Timeout des actions
const ACTION_TIMEOUT = 30000; // 30 secondes

// Taille maximale de sauvegarde
const MAX_BACKUP_SIZE = '1GB';
```

### Variables d'Environnement

```env
# Optionnel : Configuration de sauvegarde
BACKUP_STORAGE_PATH=/var/backups/collabwave
BACKUP_RETENTION_DAYS=30

# Optionnel : Configuration de cache
CACHE_STORAGE_PATH=/tmp/collabwave-cache
CACHE_MAX_SIZE=500MB
```

## 🐛 Dépannage

### Problèmes Courants

1. **Action qui ne répond pas**

   ```bash
   # Vérifier les logs serveur
   tail -f logs/server.log

   # Vérifier la base de données
   npm run db:studio
   ```

2. **Erreur d'authentification**

   ```javascript
   // Vérifier le token dans la console
   console.log(document.cookie);

   // Vérifier le rôle utilisateur
   fetch('/api/auth/me')
     .then(r => r.json())
     .then(console.log);
   ```

3. **Timeout d'action**
   ```javascript
   // Augmenter le timeout dans l'API
   const TIMEOUT = 60000; // 1 minute
   ```

### Messages d'Erreur

| Erreur                | Cause              | Solution          |
| --------------------- | ------------------ | ----------------- |
| `Token manquant`      | Non connecté       | Se reconnecter    |
| `Accès refusé`        | Pas admin          | Vérifier le rôle  |
| `Action non reconnue` | Bug code           | Vérifier l'API    |
| `Timeout`             | Action trop longue | Augmenter timeout |

## 📈 Bonnes Pratiques

### Fréquence Recommandée

| Action              | Fréquence          | Moment       |
| ------------------- | ------------------ | ------------ |
| Vider le cache      | Après mises à jour | Maintenance  |
| Optimiser DB        | Hebdomadaire       | Nuit         |
| Nettoyer logs       | Mensuelle          | Weekend      |
| Redémarrer services | Si nécessaire      | Maintenance  |
| Vérifier santé      | Quotidienne        | Matin        |
| Mettre à jour index | Après import       | Après ajouts |
| Sauvegarde complète | Quotidienne        | Nuit         |

### Ordre d'Exécution

Pour une maintenance complète :

1. 🏥 **Vérifier la santé** (diagnostic initial)
2. 💾 **Sauvegarde complète** (sécurité)
3. 📝 **Nettoyer les logs** (espace disque)
4. 🗃️ **Optimiser la DB** (performance)
5. 🔍 **Mettre à jour l'index** (recherche)
6. 🧹 **Vider le cache** (fraîcheur)
7. 🔄 **Redémarrer services** (finalisation)

### Surveillance

- Monitorer les temps d'exécution
- Vérifier les logs d'erreur
- Surveiller l'espace disque
- Contrôler les performances post-maintenance

## 📚 Ressources

- **Code source :** `src/app/api/admin/maintenance/route.js`
- **Interface :** `src/app/admin/settings/page.js`
- **Composant résultats :** `src/components/ui/MaintenanceResult.js`
- **Tests :** `scripts/test-maintenance.js`
- **Logs :** Table `activityLog` dans la base de données
