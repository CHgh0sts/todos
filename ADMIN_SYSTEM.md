# 🛡️ Système d'Administration CollabWave

## Vue d'ensemble

Le système d'administration de CollabWave permet aux utilisateurs ayant des permissions élevées de gérer et superviser l'ensemble de la plateforme.

## 🎭 Rôles et Permissions

### 👤 USER (Utilisateur)

- **Niveau** : 1
- **Permissions** :
  - Voir et modifier ses propres données
  - Créer et gérer ses projets
  - Collaborer sur les projets partagés

### 🛡️ MODERATOR (Modérateur)

- **Niveau** : 2
- **Permissions** :
  - Toutes les permissions USER
  - Voir tous les utilisateurs, projets et tâches
  - Modifier les informations de base des utilisateurs normaux
  - Supprimer du contenu inapproprié
  - Consulter les logs d'activité

### 👑 ADMIN (Administrateur)

- **Niveau** : 3
- **Permissions** :
  - Toutes les permissions MODERATOR
  - Modifier n'importe quel utilisateur
  - Supprimer des utilisateurs
  - Changer les rôles des utilisateurs
  - Supprimer n'importe quel projet ou tâche
  - Gérer le système complet

## 🚀 Accès au Dashboard

### Conditions d'accès

- Avoir un rôle `MODERATOR` ou `ADMIN`
- Être connecté à la plateforme

### Navigation

- **Desktop** : Menu utilisateur → "Administration"
- **Mobile** : Menu hamburger → "Administration (ROLE)"
- **URL directe** : `/admin`

## 📊 Fonctionnalités du Dashboard

### 1. Vue d'ensemble (`/admin`)

- Statistiques globales (utilisateurs, projets, tâches)
- Répartition des rôles
- Activité récente
- Navigation rapide vers les sections

### 2. Gestion des Utilisateurs (`/admin/users`)

- Liste paginée de tous les utilisateurs
- Filtres par rôle et recherche
- Modification des informations utilisateur
- Changement de rôles (ADMIN uniquement)
- Suppression d'utilisateurs (ADMIN uniquement)

### 3. Gestion des Projets (`/admin/projects`)

- Liste de tous les projets de la plateforme
- Filtres par propriétaire et recherche
- Statistiques des projets (tâches, partages)
- Suppression de projets (ADMIN uniquement)

### 4. Historique d'Activité (`/admin/activity`)

- Logs complets de toutes les actions
- Filtres par utilisateur, action, entité, date
- Statistiques d'activité
- Détails des actions avec IP et User Agent

## 🔧 APIs d'Administration

### Authentification

Toutes les APIs admin utilisent le middleware `withAdminAuth` qui :

- Vérifie l'authentification JWT
- Contrôle les permissions de rôle
- Ajoute l'utilisateur à la requête

### Endpoints disponibles

#### `/api/admin/users`

- **GET** : Liste des utilisateurs (ADMIN, MODERATOR)
- **PUT** : Modification d'utilisateur (ADMIN, MODERATOR)
- **DELETE** : Suppression d'utilisateur (ADMIN uniquement)

#### `/api/admin/projects`

- **GET** : Liste des projets (ADMIN, MODERATOR)
- **DELETE** : Suppression de projet (ADMIN uniquement)

#### `/api/admin/activity-logs`

- **GET** : Historique d'activité (ADMIN, MODERATOR)

## 📝 Système de Logging

### Actions trackées

- **Authentification** : LOGIN, LOGOUT, REGISTER
- **CRUD** : CREATE, UPDATE, DELETE, VIEW
- **Collaboration** : SHARE, INVITE, JOIN, LEAVE
- **Administration** : ADMIN_USER_UPDATE, ADMIN_ROLE_CHANGE, etc.

### Informations enregistrées

- Utilisateur qui effectue l'action
- Type d'action et entité concernée
- Utilisateur cible (pour actions admin)
- Détails de l'action (JSON)
- Adresse IP et User Agent
- Timestamp

### Utilisation du logger

```javascript
import { logActivity, ACTIONS, ENTITIES } from '@/lib/activityLogger';

await logActivity({
  userId: user.id,
  action: ACTIONS.CREATE,
  entity: ENTITIES.PROJECT,
  entityId: project.id,
  details: { name: project.name },
  ipAddress,
  userAgent
});
```

## 🛠️ Scripts de Gestion

### Promotion d'un utilisateur en admin

```bash
npm run promote-admin user@example.com
```

### Mise à jour des rôles existants

```bash
node scripts/update-user-roles.js
```

## 🔒 Sécurité

### Contrôles d'accès

- Vérification des rôles à chaque requête
- Empêche la modification de son propre rôle
- Empêche la suppression de son propre compte
- Logs de toutes les actions administratives

### Restrictions par rôle

- **MODERATOR** : Ne peut modifier que les utilisateurs normaux
- **ADMIN** : Accès complet mais avec logging

### Audit Trail

- Toutes les actions sont loggées
- Traçabilité complète des modifications
- Conservation des anciennes valeurs

## 🚨 Bonnes Pratiques

### Pour les Administrateurs

1. **Principe du moindre privilège** : N'accordez que les permissions nécessaires
2. **Surveillance régulière** : Consultez les logs d'activité
3. **Sauvegarde avant suppression** : Vérifiez avant de supprimer des données
4. **Communication** : Informez les utilisateurs des changements importants

### Pour les Modérateurs

1. **Focus sur la modération** : Concentrez-vous sur le contenu inapproprié
2. **Escalade** : Remontez les problèmes complexes aux administrateurs
3. **Documentation** : Documentez vos actions importantes

## 🔄 Migration et Déploiement

### Ajout du système de rôles

```bash
npx prisma migrate dev --name add_roles_and_activity_log
node scripts/update-user-roles.js
```

### Variables d'environnement requises

- `DATABASE_URL` : Connexion à la base de données
- `JWT_SECRET` : Secret pour les tokens JWT
- `NODE_ENV` : Environnement (production/development)

## 📈 Monitoring

### Métriques importantes

- Nombre d'utilisateurs par rôle
- Activité administrative quotidienne
- Actions de modération
- Erreurs d'authentification

### Alertes recommandées

- Création de nouveaux administrateurs
- Suppressions d'utilisateurs
- Pics d'activité anormaux
- Tentatives d'accès non autorisées

## 🆘 Dépannage

### Problèmes courants

#### Accès refusé au dashboard

1. Vérifier le rôle de l'utilisateur
2. Contrôler la validité du token JWT
3. Vérifier les permissions dans la base de données

#### Erreurs de permissions API

1. Vérifier l'authentification
2. Contrôler le middleware `withAdminAuth`
3. Vérifier les rôles autorisés

#### Logs manquants

1. Vérifier l'import de `logActivity`
2. Contrôler la connexion à la base de données
3. Vérifier les erreurs dans les logs serveur

### Support

Pour toute question ou problème, consultez :

- Les logs d'activité dans le dashboard
- Les logs serveur de l'application
- La documentation technique du projet
