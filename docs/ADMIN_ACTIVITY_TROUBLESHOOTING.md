# Dépannage - Page d'activité admin

## Problème : Page bloquée sur le loader

### Symptômes

- La page `/admin/activity` reste bloquée sur l'animation de chargement
- Aucun contenu ne s'affiche même après plusieurs secondes
- Le problème se produit particulièrement lors du rechargement de la page

### Causes possibles

1. **Problème d'authentification**

   - L'utilisateur n'est pas connecté
   - L'utilisateur n'a pas les permissions ADMIN ou MODERATOR

2. **Erreur API**

   - L'API `/api/admin/user-activity` ne répond pas
   - L'API `/api/admin/users` ne répond pas
   - Erreur de base de données

3. **Problème de state React**
   - État de loading mal géré
   - useEffect en boucle infinie

### Solution implémentée

La logique de loading a été simplifiée :

```javascript
// Avant (problématique)
const [loading, setLoading] = useState(true);
const [isInitialLoad, setIsInitialLoad] = useState(true);

if (authLoading || (loading && isInitialLoad)) {
  // Loader affiché
}

// Après (corrigé)
const [loading, setLoading] = useState(true);

if (authLoading || loading) {
  // Loader affiché
}

// Chargement initial simplifié
Promise.all([fetchUsers(), fetchLogs()]).finally(() => {
  setLoading(false);
});
```

### Débogage

Des logs de débogage ont été ajoutés temporairement :

```javascript
console.log('🔍 [Admin Activity] État actuel:', {
  authLoading,
  loading,
  userRole: user?.role,
  logsCount: logs.length
});
```

### Vérifications à effectuer

1. **Console du navigateur**

   - Ouvrir les outils de développement (F12)
   - Vérifier les logs dans la console
   - Rechercher les erreurs JavaScript

2. **Onglet Network**

   - Vérifier que les requêtes API sont envoyées
   - Vérifier les codes de réponse (200, 401, 500, etc.)
   - Vérifier le contenu des réponses

3. **État de l'authentification**
   - Vérifier que l'utilisateur est connecté
   - Vérifier le rôle de l'utilisateur (ADMIN ou MODERATOR)

### Commandes de test

```bash
# Tester l'API d'activité
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/user-activity

# Tester l'API des utilisateurs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/users

# Vérifier les logs du serveur
npm run dev
```

### Corrections appliquées

1. **Simplification du loading**

   - Suppression de `isInitialLoad`
   - Gestion directe avec `loading` uniquement

2. **Chargement parallèle**

   - `fetchUsers()` et `fetchLogs()` en parallèle
   - `setLoading(false)` appelé après les deux

3. **Gestion d'erreurs améliorée**

   - Logs de débogage détaillés
   - Gestion des cas d'erreur

4. **Conditions de useEffect clarifiées**
   - Éviter les appels multiples
   - Dépendances correctes

### Si le problème persiste

1. **Vider le cache du navigateur**
2. **Redémarrer le serveur de développement**
3. **Vérifier la base de données**
4. **Vérifier les variables d'environnement**

### Suppression des logs de débogage

Une fois le problème résolu, supprimer les `console.log` temporaires :

```bash
# Rechercher les logs de débogage
grep -n "console.log.*Admin Activity" src/app/admin/activity/page.js

# Les supprimer manuellement
```
