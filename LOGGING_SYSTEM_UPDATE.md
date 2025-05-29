# Mise à jour du système de logging - Ajout du champ textLog

## Résumé des modifications

Le système de logging d'activité utilisateur a été entièrement refactorisé pour inclure un champ `textLog` qui génère automatiquement des phrases descriptives en français pour chaque action.

## Modifications de la base de données

### Nouveau schéma Prisma

```prisma
model UserActivity {
  id        Int      @id @default(autoincrement())
  userId    Int
  element   String // Navigation, Create, Edit, Delete
  typeLog   String? // Détails de l'action (page visitée, élément créé/modifié/supprimé, etc.)
  textLog   String? // Description textuelle de l'action
  from      Json? // État avant l'action (pour Edit/Delete)
  to        Json? // État après l'action (pour Create/Edit)
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("user_activities")
}
```

### Migration appliquée

- Ajout des champs `from`, `to` et `textLog`
- Conservation de la compatibilité avec l'ancien système

## Modifications du code

### 1. Système de logging unifié (`src/lib/userActivityLogger.js`)

#### Nouvelle fonction principale

```javascript
export async function logAdd(userId, element, type, from = null, to = null, ipAddress = null, userAgent = null, textLog = null)
```

#### Fonction de génération de textLog

```javascript
export function generateTextLog(element, type, userName, from = null, to = null)
```

**Exemples de messages générés :**

- `"La tâche [Nom de la tâche] a été créée par [Utilisateur]"`
- `"Le projet [Nom du projet] a été modifié par [Utilisateur]"`
- `"La catégorie [Nom de la catégorie] a été supprimée par [Utilisateur]"`
- `"[Utilisateur] a navigué vers [Dashboard]"`

### 2. APIs mises à jour

#### Tâches (Todos)

- **`src/app/api/todos/route.js`** : POST avec textLog
- **`src/app/api/todos/[id]/route.js`** : PUT et DELETE avec textLog

#### Catégories

- **`src/app/api/categories/route.js`** : POST avec textLog
- **`src/app/api/categories/[id]/route.js`** : PUT et DELETE avec textLog

#### Projets

- **`src/app/api/projects/route.js`** : POST avec textLog
- **`src/app/api/projects/[id]/route.js`** : PUT et DELETE avec textLog

### 3. Interface d'administration (`src/app/admin/activity/page.js`)

#### Modifications des filtres

- Changement de `action` vers `typeLog`
- Filtres : Navigation, create, edit, delete

#### Affichage prioritaire du textLog

```javascript
const getActivityDetails = log => {
  // Si textLog est disponible, l'utiliser directement
  if (log.textLog) {
    return {
      description: `${log.element || 'élément'}`,
      target: log.textLog,
      extra: ''
    };
  }

  // Fallback vers l'ancien système
  // ...
};
```

#### Stylisation des éléments entre crochets

Le système détecte automatiquement les éléments entre crochets `[nom]` dans les messages textLog et les stylise avec des couleurs différentes :

- **Utilisateurs** : Fond vert avec bordure verte
- **Pages** (navigation) : Fond orange avec bordure orange
- **Éléments** (tâches, projets, catégories) : Fond bleu avec bordure bleue

```javascript
const parseTextLog = textLog => {
  // Regex pour détecter les éléments entre crochets [nom]
  const regex = /\[([^\]]+)\]/g;

  // Déterminer le type d'élément
  const isUser = textBefore.includes('par ') || textBefore.startsWith('[') || textBefore.includes('navigué');
  const isPage = textBefore.includes('navigué vers') || textAfter.includes('navigué');

  // Styles différents pour utilisateurs, pages et éléments
  const userStyle = 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100';
  const pageStyle = 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100';
  const elementStyle = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100';

  return <span className={styleToApply}>{match[1]}</span>;
};
```

**Rendu visuel :**

- `"La tâche [Nom de la tâche] a été créée par [Utilisateur]"`
  - `[Nom de la tâche]` → Badge bleu (élément)
  - `[Utilisateur]` → Badge vert (utilisateur)
- `"[Utilisateur] a navigué vers [Dashboard]"`
  - `[Utilisateur]` → Badge vert (utilisateur)
  - `[Dashboard]` → Badge orange (page)

## Tests et validation

### Script de test (`scripts/test-new-logging-model.js`)

- **8 scénarios de test** : tâches, catégories, projets
- **Actions testées** : create, edit, delete, navigation
- **Validation** : textLog généré, champs from/to sauvegardés

### Résultats des tests

```
✅ Test du nouveau modèle de logging avec textLog terminé avec succès!
🎯 10 logs testés : tâches, catégories et projets
```

## Avantages du nouveau système

### 1. Lisibilité améliorée

- Messages en français complets et descriptifs
- Plus besoin d'interpréter les données JSON

### 2. Compatibilité

- Fallback vers l'ancien système si textLog indisponible
- Migration progressive possible

### 3. Traçabilité complète

- Champs `from` et `to` pour sauvegarder les états
- Informations IP et User-Agent conservées

### 4. Maintenance simplifiée

- Une seule fonction `logAdd` pour tous les types d'actions
- Génération automatique des messages

### 5. Interface utilisateur améliorée

- **Stylisation automatique** : Les éléments entre crochets sont automatiquement stylisés
- **Différenciation visuelle** : Couleurs différentes pour les utilisateurs (vert) et les éléments (bleu)
- **Mode sombre supporté** : Styles adaptés pour le thème sombre
- **Tooltips informatifs** : Indication du type d'élément au survol

## Structure des données

### Exemple de log créé

```json
{
  "id": 123,
  "userId": 1,
  "element": "tâche",
  "typeLog": "create",
  "textLog": "La tâche [Ma nouvelle tâche] a été créée par [Utilisateur Test]",
  "from": null,
  "to": {
    "id": 456,
    "title": "Ma nouvelle tâche",
    "description": "Description de la tâche",
    "completed": false,
    "priority": "medium"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Migration et déploiement

### Étapes réalisées

1. ✅ Modification du schéma Prisma
2. ✅ Migration de la base de données
3. ✅ Refactorisation du système de logging
4. ✅ Mise à jour de toutes les APIs
5. ✅ Adaptation de l'interface d'administration
6. ✅ Tests complets du système
7. ✅ Nettoyage des anciens fichiers

### Prochaines étapes recommandées

- Surveiller les performances en production
- Ajouter des logs pour d'autres actions si nécessaire
- Considérer l'archivage des anciens logs sans textLog

## Conclusion

Le nouveau système de logging avec textLog offre une expérience utilisateur grandement améliorée dans l'interface d'administration, avec des messages clairs et descriptifs en français, tout en conservant la traçabilité complète des actions grâce aux champs `from` et `to`.

# Système de Logging d'Activité Utilisateur - Mise à jour

## Vue d'ensemble

Ce document décrit la mise à jour majeure du système de logging d'activité utilisateur de CollabWave, incluant l'ajout des champs `from`, `to` et `textLog` pour un suivi plus détaillé et une meilleure lisibilité.

## Nouvelles fonctionnalités

### 1. Champs de traçabilité

- **`from`** (JSON) : État avant l'action (pour Edit/Delete)
- **`to`** (JSON) : État après l'action (pour Create/Edit)
- **`textLog`** (String) : Description textuelle en français de l'action

### 2. Génération automatique de textLog

- Messages descriptifs en français
- Noms d'éléments et utilisateurs entourés de crochets `[]` pour stylisation
- Support de tous les types d'actions (create, edit, delete, Navigation)

### 3. Mapping des URLs vers noms de pages

- Conversion automatique des URLs techniques vers des noms lisibles en français
- Support des pages dynamiques avec paramètres
- Fallback intelligent pour les URLs non mappées

## Structure des données

### Modèle UserActivity mis à jour

```prisma
model UserActivity {
  id        Int      @id @default(autoincrement())
  userId    Int
  element   String?
  typeLog   String
  textLog   String?  // NOUVEAU
  from      Json?    // NOUVEAU
  to        Json?    // NOUVEAU
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Exemples de données

#### Création d'une tâche

```json
{
  "userId": 1,
  "element": "tâche",
  "typeLog": "create",
  "textLog": "La tâche [Ma nouvelle tâche] a été créée par [John Doe]",
  "from": null,
  "to": {
    "id": 123,
    "title": "Ma nouvelle tâche",
    "priority": "high",
    "completed": false,
    "description": "Description de la tâche"
  }
}
```

#### Navigation vers une page

```json
{
  "userId": 1,
  "element": "/admin/activity",
  "typeLog": "Navigation",
  "textLog": "[John Doe] a navigué vers [Activités]",
  "from": null,
  "to": null
}
```

## API unifiée

### Fonction principale : `logAdd`

```javascript
await logAdd(
  userId, // ID de l'utilisateur
  element, // Type d'élément ou URL
  type, // Type d'action
  from, // État avant (optionnel)
  to, // État après (optionnel)
  ipAddress, // Adresse IP (optionnel)
  userAgent, // User Agent (optionnel)
  textLog // Message descriptif (optionnel, généré automatiquement)
);
```

### Génération automatique de textLog

```javascript
import { generateTextLog } from '../lib/userActivityLogger.js';

const textLog = generateTextLog(
  'tâche', // Type d'élément
  'create', // Type d'action
  'John Doe', // Nom de l'utilisateur
  null, // État avant
  { title: 'Ma tâche' } // État après
);
// Résultat: "La tâche [Ma tâche] a été créée par [John Doe]"
```

### Mapping des URLs

```javascript
import { mapUrlToPageName } from '../lib/userActivityLogger.js';

const pageName = mapUrlToPageName('/admin/activity');
// Résultat: "Activités"

const pageName2 = mapUrlToPageName('/todos/123');
// Résultat: "Projet"
```

## Mapping des pages supportées

### Pages principales

- `/` → Accueil
- `/dashboard` → Tableau de bord
- `/projects` → Projets
- `/todos` → Tâches
- `/categories` → Catégories
- `/profile` → Profil
- `/notifications` → Notifications
- `/friends` → Amis
- `/invitations` → Invitations

### Administration

- `/admin` → Administration
- `/admin/activity` → Activités
- `/admin/users` → Utilisateurs
- `/admin/projects` → Projets Admin
- `/admin/settings` → Paramètres Admin

### Authentification

- `/auth/login` → Connexion
- `/auth/register` → Inscription
- `/auth/logout` → Déconnexion
- `/auth/forgot-password` → Mot de passe oublié
- `/auth/reset-password` → Réinitialisation
- `/auth/verify` → Vérification

### Pages dynamiques

- `/todos/*` → Projet
- `/projects/*` → Détails du projet
- `/share/*` → Partage
- `/admin/*` → Administration

## Stylisation dans l'interface

### Fonction de parsing pour l'affichage

```javascript
function parseTextLog(textLog) {
  if (!textLog) return null;

  const parts = [];
  let lastIndex = 0;
  const regex = /\[([^\]]+)\]/g;
  let match;

  while ((match = regex.exec(textLog)) !== null) {
    // Texte avant le crochet
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: textLog.slice(lastIndex, match.index)
      });
    }

    // Contenu entre crochets avec détection du type
    const content = match[1];
    let elementType = 'element'; // Par défaut

    // Détecter si c'est un utilisateur (après "par ")
    const beforeMatch = textLog.slice(0, match.index);
    if (beforeMatch.endsWith('par ')) {
      elementType = 'user';
    }
    // Détecter si c'est une page de navigation (après "vers ")
    else if (beforeMatch.includes('navigué vers ')) {
      elementType = 'page';
    }

    parts.push({
      type: elementType,
      content: content
    });

    lastIndex = regex.lastIndex;
  }

  // Texte restant
  if (lastIndex < textLog.length) {
    parts.push({
      type: 'text',
      content: textLog.slice(lastIndex)
    });
  }

  return parts;
}
```

### Styles CSS

```css
.activity-user {
  @apply text-green-600 dark:text-green-400 font-medium;
}

.activity-page {
  @apply text-orange-600 dark:text-orange-400 font-medium;
}

.activity-element {
  @apply text-blue-600 dark:text-blue-400 font-medium;
}
```

## Migration

### 1. Migration de base de données

```bash
npx prisma migrate dev --name add_from_to_textlog
```

### 2. Mise à jour du code

- Remplacer les appels `logCreate`, `logEdit`, `logDelete` par `logAdd`
- Ajouter la génération de `textLog` avec `generateTextLog`
- Mettre à jour l'interface d'administration pour utiliser `parseTextLog`

### 3. Exemple de migration d'API

**Avant :**

```javascript
await logCreate(userId, 'tâche', taskName, taskId, ipAddress, userAgent);
```

**Après :**

```javascript
const textLog = generateTextLog('tâche', 'create', userName, null, createdTask);
await logAdd(userId, 'tâche', 'create', null, createdTask, ipAddress, userAgent, textLog);
```

## Tests

### Script de test complet

```bash
node scripts/test-new-logging-model.js
```

Ce script teste :

- ✅ Création, modification, suppression de tâches
- ✅ Création de catégories et projets
- ✅ Navigation avec mapping des pages
- ✅ Génération automatique des textLog
- ✅ Sauvegarde des états `from` et `to`

## Avantages

1. **Traçabilité complète** : États avant/après pour audit détaillé
2. **Lisibilité améliorée** : Messages en français avec stylisation
3. **Interface moderne** : Couleurs différenciées pour utilisateurs, pages et éléments
4. **Maintenance facilitée** : API unifiée et mapping centralisé
5. **Extensibilité** : Facile d'ajouter de nouveaux types d'éléments ou pages

## Compatibilité

- ✅ Rétrocompatible avec les anciens logs
- ✅ Fallback automatique si `textLog` est vide
- ✅ Support du mode sombre
- ✅ Responsive design
