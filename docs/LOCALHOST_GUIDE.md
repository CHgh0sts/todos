# Guide de Configuration Localhost

## 🎯 Objectif

Ce guide vous aide à éviter les redirections vers le domaine de production (`todo.chghosts.fr`) lors du développement en local.

## ✅ Modifications Effectuées

### 1. **URLs Relatives**

Tous les liens ont été convertis en chemins relatifs :

```javascript
// ❌ Avant (URLs absolues)
const url = new URL(`/api/projects/${projectId}`, window.location.origin);
const shareUrl = `${window.location.origin}/share/${linkId}`;

// ✅ Après (URLs relatives)
const url = `/api/projects/${projectId}${isAdminMode ? '?admin=true' : ''}`;
const shareUrl = `${window.location.protocol}//${window.location.host}/share/${linkId}`;
```

### 2. **Configuration Socket.IO**

Le SocketContext utilise maintenant l'host actuel :

```javascript
// ✅ Configuration dynamique
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return `${window.location.protocol}//${window.location.host}`;
};
```

### 3. **APIs et Composants**

- `ProjectCollaborationModal.js` : URLs de partage relatives
- `SocketDiagnostic.js` : Affichage de l'URL actuelle
- `todos/[projectId]/page.js` : Appels API relatifs

## 🔧 Commandes Utiles

### Vérifier la Configuration

```bash
npm run check-localhost
```

### Nettoyer le Cache

```bash
rm -rf .next
npm run dev
```

### Redémarrer Proprement

```bash
pkill -f "node server.js"
npm run dev
```

## 🚨 Problèmes Courants

### 1. **Cache du Navigateur**

Si vous êtes toujours redirigé vers le domaine de production :

- Ouvrez les DevTools (F12)
- Allez dans l'onglet "Application" ou "Storage"
- Supprimez tous les cookies pour `localhost:3000`
- Videz le cache du navigateur (Ctrl+Shift+R)

### 2. **Cookies de Production**

Les cookies du domaine de production peuvent interférer :

```javascript
// Vérifiez dans la console du navigateur
document.cookie;
```

### 3. **Variables d'Environnement**

Assurez-vous qu'aucune variable ne pointe vers la production :

```bash
# Vérifiez les variables
env | grep -i url
env | grep -i domain
```

## 🔍 Diagnostic

### Test Manuel

1. Ouvrez `http://localhost:3000`
2. Vérifiez l'URL dans la barre d'adresse
3. Testez la navigation entre les pages
4. Vérifiez les appels API dans les DevTools

### Script Automatique

```bash
npm run check-localhost
```

## 📝 Bonnes Pratiques

### 1. **Toujours Utiliser des Chemins Relatifs**

```javascript
// ✅ Bon
fetch('/api/projects');
router.push('/admin');

// ❌ Éviter
fetch('http://localhost:3000/api/projects');
window.location.href = 'http://localhost:3000/admin';
```

### 2. **Configuration Dynamique**

```javascript
// ✅ S'adapte à l'environnement
const baseUrl = `${window.location.protocol}//${window.location.host}`;

// ❌ Hardcodé
const baseUrl = 'https://todo.chghosts.fr';
```

### 3. **Vérification des Redirections**

```javascript
// ✅ Vérifier avant de rediriger
if (window.location.hostname === 'localhost') {
  // Logique de développement
} else {
  // Logique de production
}
```

## 🛠️ Dépannage

### Problème : Redirection Automatique

1. Vider le cache : `rm -rf .next`
2. Supprimer les cookies du navigateur
3. Redémarrer le serveur : `npm run dev`
4. Tester avec un navigateur privé

### Problème : Socket.IO ne se connecte pas

1. Vérifier l'URL dans les DevTools
2. S'assurer que le serveur écoute sur localhost:3000
3. Vérifier les origines autorisées dans `server.js`

### Problème : APIs inaccessibles

1. Vérifier que le serveur est démarré
2. Tester avec `npm run check-localhost`
3. Vérifier les headers CORS

## 📊 Monitoring

### Logs Serveur

Le serveur affiche les origines autorisées au démarrage :

```
🌍 Origines autorisées: [ 'http://localhost:3000', 'http://127.0.0.1:3000' ]
```

### Logs Client

Vérifiez la console du navigateur pour les erreurs de CORS ou de redirection.

---

**Note :** Ce guide garantit que votre environnement de développement reste isolé de la production.
