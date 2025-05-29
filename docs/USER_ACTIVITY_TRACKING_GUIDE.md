# Guide du Système de Tracking d'Activité Utilisateur

## 📋 Vue d'ensemble

Le système de tracking d'activité utilisateur permet de surveiller et d'analyser toutes les actions effectuées par les utilisateurs sur la plateforme. Il capture 4 types d'actions principales :

- **🧭 Navigation** : Visites de pages
- **➕ Create** : Créations d'éléments (projets, tâches, catégories)
- **✏️ Edit** : Modifications d'éléments existants
- **🗑️ Delete** : Suppressions d'éléments

## 🏗️ Architecture

### Base de données

Le système utilise une table `user_activities` avec la structure suivante :

```sql
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  action VARCHAR NOT NULL, -- Navigation, Create, Edit, Delete
  details JSONB,           -- Détails de l'action
  ipAddress VARCHAR,       -- Adresse IP de l'utilisateur
  userAgent VARCHAR,       -- User Agent du navigateur
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Composants principaux

1. **ActivityTracker** (`src/components/ActivityTracker.js`)

   - Composant React invisible qui track automatiquement les navigations
   - Expose des fonctions globales pour tracker les autres actions

2. **userActivityLogger** (`src/lib/userActivityLogger.js`)

   - Fonctions utilitaires pour enregistrer les activités
   - Types d'actions et helpers

3. **API Endpoint** (`src/app/api/user-activity/route.js`)

   - Reçoit et enregistre les activités côté serveur

4. **Page d'administration** (`src/app/admin/activity/page.js`)
   - Interface pour visualiser et filtrer les activités

## 🚀 Utilisation

### Tracking automatique des navigations

Le tracking des navigations est automatique grâce au composant `ActivityTracker` placé dans le layout principal. Il capture :

- Changements de page
- Nom de la page lisible
- Chemin complet
- Timestamp

### Tracking manuel des actions

Pour tracker les créations, modifications et suppressions, utilisez le hook `useActivityTracker` :

```javascript
import { useActivityTracker } from '@/components/ActivityTracker';

function MyComponent() {
  const { trackCreate, trackEdit, trackDelete } = useActivityTracker();

  const handleCreateProject = async projectData => {
    // Créer le projet
    const project = await createProject(projectData);

    // Tracker la création
    trackCreate('projet', project.name, project.id);
  };

  const handleEditProject = async (projectId, changes) => {
    // Modifier le projet
    await updateProject(projectId, changes);

    // Tracker la modification
    trackEdit('projet', project.name, projectId, changes);
  };

  const handleDeleteProject = async project => {
    // Supprimer le projet
    await deleteProject(project.id);

    // Tracker la suppression
    trackDelete('projet', project.name, project.id);
  };
}
```

### Tracking côté serveur

Pour tracker les actions directement côté serveur (dans les APIs) :

```javascript
import { logCreate, logEdit, logDelete, extractRequestInfo } from '@/lib/userActivityLogger';

export async function POST(request) {
  // ... logique de création

  const { ipAddress, userAgent } = extractRequestInfo(request);
  await logCreate(userId, 'projet', projectName, projectId, ipAddress, userAgent);

  // ... retourner la réponse
}
```

## 📊 Dashboard d'administration

### Accès

Le dashboard est accessible aux utilisateurs avec les rôles `ADMIN` ou `MODERATOR` à l'adresse `/admin/activity`.

### Fonctionnalités

#### Statistiques en temps réel

- **Cartes de statistiques** : Nombre d'actions par type (24h)
- **Mise à jour automatique** : Données rafraîchies en temps réel

#### Filtres avancés

- **Type d'action** : Navigation, Create, Edit, Delete
- **Utilisateur** : Recherche par nom d'utilisateur
- **Période** : Date de début et fin
- **Pagination** : 25, 50 ou 100 éléments par page

#### Affichage des activités

Format lisible : `Utilisateur | action -> élément | date`

Exemples :

- `CHghosts | navigation -> Mes Projets | 29/05/2025 à 20:20`
- `Alice | création -> projet "Site Web" | 29/05/2025 à 20:15`
- `Bob | modification -> tâche "Design" | 29/05/2025 à 20:10`

## 🔧 Configuration

### Variables d'environnement

Aucune configuration spéciale requise. Le système utilise la même base de données que l'application principale.

### Activation/Désactivation

Le tracking est automatiquement activé pour tous les utilisateurs connectés. Pour désactiver :

1. Retirer le composant `ActivityTracker` du layout
2. Commenter les appels aux fonctions de tracking dans les APIs

## 🧪 Tests

### Scripts disponibles

```bash
# Test complet du système
npm run test-activity

# Afficher les statistiques globales
npm run test-activity-stats

# Nettoyer les données de test
npm run test-activity-cleanup
```

### Test manuel

1. Se connecter à l'application
2. Naviguer entre les pages
3. Créer/modifier/supprimer des éléments
4. Vérifier dans `/admin/activity`

## 📈 Métriques et Analytics

### Données collectées

Pour chaque activité :

- **Utilisateur** : ID, nom, rôle
- **Action** : Type d'action effectuée
- **Détails** : Informations spécifiques (nom de l'élément, changements, etc.)
- **Contexte** : IP, User Agent, timestamp
- **Entité** : Type et ID de l'élément concerné

### Statistiques disponibles

- **Activité par utilisateur** : Qui fait quoi
- **Actions populaires** : Types d'actions les plus fréquentes
- **Pages visitées** : Analyse de navigation
- **Tendances temporelles** : Évolution de l'activité

## 🔒 Sécurité et Confidentialité

### Données sensibles

- **Adresses IP** : Stockées pour la sécurité, peuvent être anonymisées
- **User Agents** : Utilisés pour l'analyse technique
- **Contenu** : Seuls les noms/titres sont stockés, pas le contenu complet

### Rétention des données

- **Recommandation** : Conserver 90 jours maximum
- **Nettoyage automatique** : À implémenter selon les besoins
- **RGPD** : Respecter les droits de suppression des utilisateurs

### Accès aux données

- **Administrateurs** : Accès complet via le dashboard
- **Modérateurs** : Accès en lecture seule
- **Utilisateurs** : Pas d'accès direct (à implémenter si nécessaire)

## 🛠️ Maintenance

### Nettoyage des données

```sql
-- Supprimer les activités de plus de 90 jours
DELETE FROM user_activities
WHERE createdAt < NOW() - INTERVAL '90 days';

-- Supprimer les activités d'un utilisateur spécifique
DELETE FROM user_activities
WHERE userId = ?;
```

### Optimisation des performances

1. **Index sur les colonnes fréquemment filtrées** :

   ```sql
   CREATE INDEX idx_user_activities_user_date ON user_activities(userId, createdAt);
   CREATE INDEX idx_user_activities_action_date ON user_activities(action, createdAt);
   ```

2. **Pagination** : Toujours utiliser LIMIT/OFFSET pour les grandes listes

3. **Archivage** : Déplacer les anciennes données vers une table d'archive

### Monitoring

- **Volume de données** : Surveiller la croissance de la table
- **Performance** : Temps de réponse des requêtes
- **Erreurs** : Logs d'erreurs de tracking

## 🔄 Évolutions futures

### Fonctionnalités à ajouter

1. **Analytics avancés** :

   - Graphiques de tendances
   - Heatmaps d'activité
   - Rapports automatiques

2. **Alertes** :

   - Activité suspecte
   - Pics d'utilisation
   - Erreurs fréquentes

3. **Export de données** :

   - CSV, JSON
   - Rapports personnalisés
   - API d'export

4. **Tracking avancé** :
   - Temps passé sur les pages
   - Clics et interactions
   - Parcours utilisateur

### Intégrations possibles

- **Google Analytics** : Synchronisation des données
- **Mixpanel/Amplitude** : Analytics comportementaux
- **Slack/Discord** : Notifications d'activité
- **Webhook** : Intégrations tierces

## 📚 Ressources

### Documentation technique

- [Prisma Schema](../prisma/schema.prisma)
- [API Routes](../src/app/api/)
- [Components](../src/components/)

### Scripts utiles

- [Test du système](../scripts/test-activity-tracking.js)
- [Migration de base de données](../prisma/migrations/)

### Exemples d'utilisation

Voir les fichiers suivants pour des exemples concrets :

- `src/app/api/projects/route.js` : Tracking de création de projet
- `src/components/ActivityTracker.js` : Tracking de navigation
- `src/app/admin/activity/page.js` : Interface d'administration

---

## 🆘 Support

Pour toute question ou problème :

1. Vérifier les logs de l'application
2. Tester avec le script `npm run test-activity`
3. Consulter la documentation Prisma
4. Vérifier la configuration de la base de données

**Note** : Ce système est conçu pour être léger et performant, mais peut générer beaucoup de données selon l'utilisation. Surveillez régulièrement l'espace disque et optimisez selon vos besoins.
