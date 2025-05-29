# Guide du Mode Administrateur des Projets

## 📋 Vue d'ensemble

Le mode administrateur permet aux utilisateurs avec les rôles `ADMIN` ou `MODERATOR` d'accéder à tous les projets de la plateforme, même s'ils ne sont pas propriétaires ou collaborateurs.

## 🔧 Comment utiliser le Mode Admin

### 1. Accès via le Dashboard Admin

1. **Connexion :** Connectez-vous avec un compte `ADMIN` ou `MODERATOR`
2. **Navigation :** Allez sur `/admin/projects`
3. **Visualisation :** Cliquez sur l'icône "👁️" (voir) d'un projet
4. **URL générée :** `/todos/{projectId}?admin=true`

### 2. Accès Direct par URL

Vous pouvez accéder directement en ajoutant `?admin=true` à l'URL d'un projet :

```
Mode normal:    /todos/123
Mode admin:     /todos/123?admin=true
Mode admin+edit: /todos/123?admin=true&edit=true
```

## 🎯 Fonctionnalités du Mode Admin

### Permissions Spéciales

- **ADMIN :** Permission `super_admin` - Accès complet
- **MODERATOR :** Permission `moderator` - Accès étendu

### Indicateurs Visuels

1. **Bannière d'avertissement :**

   - Rouge pour les ADMIN
   - Jaune pour les MODERATOR
   - Indique le mode actif et les privilèges

2. **Lien de retour :**

   - Retour vers `/admin/projects` au lieu de `/projects`

3. **Badge de permission :**
   - Affiche le niveau de permission spécial

## 🔒 Sécurité et Permissions

### Vérifications Côté Serveur

L'API vérifie automatiquement :

```javascript
// Vérification du rôle utilisateur
if (isAdminMode && !['ADMIN', 'MODERATOR'].includes(currentUser.role)) {
  return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
}
```

### Vérifications Côté Client

Le frontend vérifie aussi les permissions :

```javascript
// Redirection si permissions insuffisantes
if (isAdminMode && !['ADMIN', 'MODERATOR'].includes(user.role)) {
  toast.error('Accès refusé. Permissions insuffisantes pour le mode administrateur.');
  router.push('/projects');
  return;
}
```

## 🧪 Tests et Dépannage

### Script de Test Automatique

```bash
# Tester le mode admin (sans authentification)
npm run test-admin-mode

# Résultat attendu : API accessible, authentification requise
```

### Tests Manuels

1. **Test avec compte ADMIN :**

   - Connectez-vous en tant qu'ADMIN
   - Allez sur `/admin/projects`
   - Cliquez sur "voir" un projet
   - Vérifiez la bannière rouge "Mode Administrateur Actif"

2. **Test avec compte MODERATOR :**

   - Connectez-vous en tant que MODERATOR
   - Même procédure
   - Vérifiez la bannière jaune "Mode Modérateur Actif"

3. **Test avec compte USER :**
   - Connectez-vous en tant qu'utilisateur normal
   - Essayez d'accéder à `/todos/123?admin=true`
   - Devrait être redirigé vers `/projects` avec erreur

### Logs de Debugging

L'API affiche des logs détaillés :

```
🔍 [Project API] Récupération projet 1, mode admin: true, userId: 19
👤 [Project API] Utilisateur trouvé: CHghosts (ADMIN)
🔓 [Project API] Mode admin/modérateur - accès étendu autorisé
✅ [Project API] Projet trouvé: Mon Projet
🔧 [Project API] Permissions spéciales accordées: super_admin
📤 [Project API] Réponse envoyée - isAdminMode: true, permission: super_admin
```

## 🐛 Problèmes Courants

### 1. "Accès refusé" malgré le rôle ADMIN

**Causes possibles :**

- Token JWT expiré
- Rôle utilisateur incorrect dans la base de données
- Cache navigateur

**Solutions :**

```bash
# Vérifier le rôle dans la base de données
npm run db:studio

# Promouvoir un utilisateur en ADMIN
npm run promote-admin

# Vider le cache navigateur
Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
```

### 2. Bannière admin ne s'affiche pas

**Causes possibles :**

- `isAdminMode` non défini côté client
- Problème de récupération des paramètres URL
- Erreur dans l'API

**Solutions :**

```javascript
// Vérifier dans la console du navigateur
console.log('isAdminMode:', searchParams.get('admin') === 'true');
console.log('project.isAdminMode:', project?.isAdminMode);
console.log('user.role:', user?.role);
```

### 3. Redirection inattendue

**Causes possibles :**

- Middleware d'authentification
- Vérification de permissions trop stricte
- Erreur dans la logique de routage

**Solutions :**

- Vérifier les logs serveur
- Tester avec un projet dont vous êtes propriétaire
- Vérifier la validité du token JWT

## 📊 Monitoring

### Métriques à Surveiller

1. **Utilisation du mode admin :**

   - Nombre d'accès en mode admin
   - Projets les plus consultés par les admins
   - Fréquence d'utilisation par utilisateur

2. **Erreurs d'accès :**
   - Tentatives d'accès non autorisées
   - Erreurs de permissions
   - Échecs d'authentification

### Logs d'Activité

Tous les accès en mode admin sont loggés :

```javascript
await logActivity(userId, ACTIONS.ADMIN_PROJECT_ACCESS, ENTITIES.PROJECT, projectId, { adminMode: true, permission: userPermission });
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Optionnel : Désactiver le mode admin
DISABLE_ADMIN_MODE=false

# Optionnel : Rôles autorisés (séparés par des virgules)
ADMIN_ROLES=ADMIN,MODERATOR

# Optionnel : Logging détaillé
DEBUG_ADMIN_MODE=true
```

### Paramètres de Sécurité

```javascript
// Dans l'API, vous pouvez ajuster :
const ALLOWED_ADMIN_ROLES = ['ADMIN', 'MODERATOR'];
const REQUIRE_EXPLICIT_ADMIN_FLAG = true;
const LOG_ADMIN_ACCESS = true;
```

## 📚 Architecture Technique

### Flux de Données

1. **URL avec `?admin=true`** → Frontend détecte le mode admin
2. **Frontend vérifie le rôle** → Redirection si non autorisé
3. **API reçoit `admin=true`** → Vérifie les permissions
4. **Permissions étendues** → Accès à tous les projets
5. **Réponse enrichie** → `isAdminMode: true` + permissions spéciales

### Structure des Permissions

```javascript
// Permissions normales
const normalPermissions = {
  view: ['read'],
  edit: ['read', 'write'],
  admin: ['read', 'write', 'manage']
};

// Permissions admin
const adminPermissions = {
  moderator: ['read', 'write', 'manage', 'moderate'],
  super_admin: ['read', 'write', 'manage', 'moderate', 'delete', 'admin']
};
```

## 🚀 Bonnes Pratiques

### Pour les Administrateurs

1. **Utilisation responsable :**

   - N'accédez qu'aux projets nécessaires
   - Respectez la confidentialité des utilisateurs
   - Documentez vos actions importantes

2. **Sécurité :**
   - Déconnectez-vous après utilisation
   - Ne partagez jamais vos identifiants
   - Utilisez des mots de passe forts

### Pour les Développeurs

1. **Logging :**

   - Loggez tous les accès admin
   - Surveillez les tentatives non autorisées
   - Alertes en cas d'usage anormal

2. **Tests :**
   - Testez régulièrement les permissions
   - Vérifiez les redirections
   - Validez les indicateurs visuels

## 📖 Ressources

- **Code source API :** `src/app/api/projects/[id]/route.js`
- **Code source Frontend :** `src/app/todos/[projectId]/page.js`
- **Page admin projets :** `src/app/admin/projects/page.js`
- **Script de test :** `scripts/test-admin-mode.js`
- **Logs d'activité :** Table `activityLog` dans la base de données
