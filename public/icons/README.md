# Icônes PWA CollabWave

Ce dossier contient toutes les icônes nécessaires pour la Progressive Web App (PWA).

## Structure des fichiers

### Icônes principales
- `icon-16x16.png` - Favicon petit
- `icon-32x32.png` - Favicon standard
- `icon-72x72.png` - Android Chrome
- `icon-96x96.png` - Android Chrome
- `icon-128x128.png` - Android Chrome
- `icon-144x144.png` - Windows Metro
- `icon-152x152.png` - iOS Safari
- `icon-192x192.png` - Android Chrome (recommandé)
- `icon-384x384.png` - Android Chrome
- `icon-512x512.png` - Android Chrome (recommandé)

### Icônes de raccourcis
- `shortcut-projects.png` - Raccourci vers les projets
- `shortcut-notifications.png` - Raccourci vers les notifications
- `shortcut-friends.png` - Raccourci vers les amis

### Fichiers spéciaux
- `favicon.svg` - Favicon vectoriel moderne
- `safari-pinned-tab.svg` - Icône Safari onglet épinglé
- `browserconfig.xml` - Configuration Windows/IE

## Génération automatique

Les icônes peuvent être régénérées avec:
```bash
node scripts/generate-pwa-icons.js
```

## Optimisation

Pour de meilleures performances, optimisez les PNG avec:
- ImageOptim (macOS)
- TinyPNG (en ligne)
- pngquant (ligne de commande)

## Test

Testez les icônes dans Chrome DevTools:
1. F12 > Application > Manifest
2. Vérifiez que toutes les icônes se chargent
3. Testez l'installation PWA
