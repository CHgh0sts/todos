# Guide PWA CollabWave 📱

## 🎯 Vue d'ensemble

CollabWave est maintenant une **Progressive Web App (PWA)** complète qui offre une expérience native sur tous les appareils.

## ✨ Fonctionnalités PWA

### 📱 Installation

- **Bouton d'installation automatique** sur les navigateurs compatibles
- **Icône sur l'écran d'accueil** comme une app native
- **Lancement en mode standalone** (sans barre d'adresse)
- **Écran de démarrage personnalisé**

### 🔄 Fonctionnement hors ligne

- **Cache intelligent** des pages et données
- **Synchronisation automatique** au retour en ligne
- **Indicateur de statut** de connexion
- **Fonctionnalités limitées** en mode offline

### 🚀 Performance

- **Chargement instantané** des pages visitées
- **Mise en cache des APIs** importantes
- **Mises à jour automatiques** du contenu
- **Optimisation mobile** complète

## 🛠️ Architecture technique

### Service Worker (`/public/sw.js`)

```javascript
// Stratégies de cache
- Network First: Pages HTML
- Cache First: Assets statiques
- Stale While Revalidate: APIs
```

### Manifest (`/public/manifest.json`)

```json
{
  "name": "CollabWave",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#3B82F6"
}
```

### Composants PWA

- `PWAManager.js` - Gestion installation et mises à jour
- `ConnectionStatus.js` - Statut de connexion
- `usePWA()` - Hook pour état PWA

## 📋 Installation utilisateur

### Sur Android (Chrome)

1. Ouvrir `https://todo.chghosts.fr`
2. Cliquer sur "Installer CollabWave" (bannière)
3. Ou Menu > "Ajouter à l'écran d'accueil"

### Sur iOS (Safari)

1. Ouvrir `https://todo.chghosts.fr`
2. Partager > "Sur l'écran d'accueil"
3. Confirmer l'installation

### Sur Desktop (Chrome/Edge)

1. Icône d'installation dans la barre d'adresse
2. Ou Menu > "Installer CollabWave"

## 🔧 Fonctionnalités offline

### ✅ Disponible hors ligne

- Consultation des projets (cache)
- Lecture des tâches (cache)
- Navigation dans l'app
- Consultation du profil
- Lecture des notifications (cache)

### ❌ Nécessite une connexion

- Création de projets/tâches
- Modification de données
- Envoi de notifications
- Upload d'images
- Collaboration temps réel

## 🎨 Icônes et assets

### Icônes générées automatiquement

```bash
# Régénérer les icônes
node scripts/generate-pwa-icons.js
```

### Tailles d'icônes

- `16x16` à `512x512` pixels
- Format PNG optimisé
- Support maskable icons
- Raccourcis d'application

## 🚀 Déploiement

### Variables d'environnement

```bash
# Production
NEXT_PUBLIC_APP_URL=https://todo.chghosts.fr
```

### Headers requis (Vercel/Netlify)

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

## 🧪 Tests et validation

### Chrome DevTools

1. F12 > Application > Manifest
2. Vérifier toutes les icônes
3. Tester l'installation
4. Application > Service Workers
5. Simuler mode offline

### Lighthouse PWA Audit

```bash
# Score cible
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: 100
```

### Tests manuels

- [ ] Installation sur mobile
- [ ] Fonctionnement offline
- [ ] Mises à jour automatiques
- [ ] Raccourcis d'application
- [ ] Écran de démarrage

## 📊 Métriques PWA

### Engagement utilisateur

- **Temps de chargement** < 2s
- **Taux d'installation** > 10%
- **Rétention** > 50% à 7 jours
- **Sessions offline** trackées

### Performance

- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Time to Interactive** < 3s
- **Cumulative Layout Shift** < 0.1

## 🔄 Mises à jour

### Stratégie de versioning

```javascript
// sw.js
const CACHE_NAME = 'collabwave-v1.0.0';
```

### Déploiement

1. Modifier la version dans `sw.js`
2. Déployer sur production
3. Les utilisateurs reçoivent une notification
4. Mise à jour automatique au clic

## 🛡️ Sécurité PWA

### HTTPS obligatoire

- Service Workers nécessitent HTTPS
- Certificat SSL valide requis
- Redirection HTTP → HTTPS

### Permissions

- Notifications (optionnel)
- Géolocalisation (si nécessaire)
- Caméra/Micro (pour futures fonctionnalités)

## 📱 Raccourcis d'application

### Raccourcis configurés

1. **Mes Projets** → `/projects`
2. **Notifications** → `/notifications`
3. **Mes Amis** → `/friends`

### Utilisation

- Clic long sur l'icône (Android)
- Menu contextuel (Desktop)
- Accès rapide aux fonctions principales

## 🎯 Optimisations futures

### Fonctionnalités avancées

- [ ] Synchronisation en arrière-plan
- [ ] Notifications push
- [ ] Partage natif
- [ ] Raccourcis dynamiques
- [ ] Mode sombre système

### Performance

- [ ] Lazy loading des composants
- [ ] Compression Brotli
- [ ] CDN pour les assets
- [ ] Service Worker avancé

## 🐛 Dépannage

### Service Worker ne s'installe pas

```javascript
// Vérifier dans la console
navigator.serviceWorker.getRegistrations();
```

### Cache non mis à jour

```javascript
// Forcer la mise à jour
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
```

### Installation PWA non proposée

- Vérifier HTTPS
- Valider le manifest.json
- Tester sur Chrome/Edge
- Vérifier les icônes

## 📞 Support

Pour toute question sur la PWA :

1. Vérifier ce guide
2. Tester avec Chrome DevTools
3. Consulter la documentation MDN PWA
4. Contacter l'équipe technique

---

**CollabWave PWA** - Une expérience native sur tous vos appareils ! 🌊📱
