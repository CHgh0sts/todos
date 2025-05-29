# Guide des Mises à Jour Automatiques

## 📊 Vue d'ensemble

Le système de mises à jour automatiques permet d'afficher les statistiques système en temps réel dans l'interface d'administration sans recharger la page complète.

## 🔧 Fonctionnement

### Architecture

1. **useEffect séparé** : Un `useEffect` dédié gère les mises à jour automatiques
2. **Fonction optimisée** : `fetchSystemStats()` ne récupère que les statistiques système
3. **État de mise à jour** : `isUpdating` indique quand une mise à jour est en cours
4. **Indicateur visuel** : Interface utilisateur qui montre l'état en temps réel

### Composants impliqués

- **Page principale** : `src/app/admin/settings/page.js`
- **API système** : `src/app/api/admin/system-stats/route.js`
- **Mini graphiques** : `src/components/ui/MiniChart.js`
- **Graphique détaillé** : `src/components/ui/DetailedChart.js`

## 🚀 Comment tester

### 1. Test manuel dans l'interface

```bash
# Démarrer le serveur
npm run dev

# Aller sur http://localhost:3000
# Se connecter en tant qu'administrateur
# Naviguer vers /admin/settings
# Cliquer sur l'onglet "Système"
# Observer les mises à jour toutes les 5 secondes
```

### 2. Indicateurs visuels

- **Point vert clignotant** : Données en temps réel
- **Point orange clignotant** : Mise à jour en cours
- **Spinner** : Animation pendant la récupération
- **Timestamp** : Heure de la dernière mise à jour

### 3. Script de test automatique

```bash
# Test des API (nécessite une authentification)
npm run test-auto-update
```

## 📈 Métriques mises à jour

### Données principales

- **CPU Usage** : Pourcentage d'utilisation du processeur
- **Mémoire** : Utilisation mémoire en MB et pourcentage
- **Stockage** : Utilisation disque en GB et pourcentage
- **Uptime** : Temps de fonctionnement du serveur

### Historique

- **100 points maximum** : Rotation automatique des anciennes données
- **Timestamp** : Chaque point a un horodatage
- **Métriques complètes** : 8 métriques différentes stockées

## 🔄 Cycle de mise à jour

```
1. Page chargée → fetchInitialData()
2. Onglet "Système" activé → Démarrage de l'interval
3. Toutes les 5 secondes → fetchSystemStats()
4. Données reçues → Mise à jour des composants
5. Changement d'onglet → Arrêt de l'interval
```

## 🎯 Optimisations

### Performance

- **Mises à jour ciblées** : Seules les stats système sont récupérées
- **Pas de loader** : Évite le clignotement de l'interface
- **Gestion d'erreur silencieuse** : Pas de toast d'erreur pour les mises à jour auto

### Interface utilisateur

- **État isUpdating** : Indique visuellement les mises à jour
- **Conservation des données** : Les graphiques gardent les données précédentes
- **Indicateur temps réel** : Feedback visuel constant

## 🐛 Dépannage

### Problèmes courants

1. **Mises à jour qui s'arrêtent**

   ```javascript
   // Vérifier dans la console du navigateur
   console.log('Interval actif:', interval !== null);
   ```

2. **Données qui ne changent pas**

   ```javascript
   // Vérifier l'API directement
   fetch('/api/admin/system-stats', { headers: authHeaders });
   ```

3. **Erreurs d'authentification**
   ```javascript
   // Vérifier le token
   console.log('Token:', Cookies.get('token'));
   ```

### Logs de débogage

```javascript
// Dans fetchSystemStats(), ajouter :
console.log('🔄 Mise à jour automatique démarrée');
console.log('📊 Nouvelles données:', statsData);
```

## 📊 Métriques de performance

### Fréquence de mise à jour

- **Intervalle** : 5 secondes
- **Condition** : Seulement sur l'onglet "Système"
- **Arrêt automatique** : Changement d'onglet ou déconnexion

### Utilisation réseau

- **Requête légère** : ~2-5KB par mise à jour
- **Pas de polling inutile** : Arrêt automatique hors onglet
- **Gestion d'erreur** : Pas de retry automatique

## 🔧 Configuration

### Modifier l'intervalle

```javascript
// Dans src/app/admin/settings/page.js
const UPDATE_INTERVAL = 5000; // 5 secondes (défaut)

// Changer pour 10 secondes
const UPDATE_INTERVAL = 10000;
```

### Ajouter de nouvelles métriques

1. **API** : Ajouter dans `system-stats/route.js`
2. **Interface** : Ajouter dans la page settings
3. **Graphiques** : Ajouter dans les composants Chart

## 📝 Tests

### Test manuel complet

1. **Chargement initial** ✓

   - Loader affiché
   - Données chargées
   - Indicateur "temps réel" activé

2. **Mises à jour automatiques** ✓

   - Toutes les 5 secondes
   - Indicateur "mise à jour en cours"
   - Nouvelles données affichées

3. **Changement d'onglet** ✓

   - Arrêt des mises à jour
   - Pas de requêtes inutiles

4. **Retour sur l'onglet** ✓
   - Redémarrage automatique
   - Reprise des mises à jour

### Validation des données

```javascript
// Vérifier la cohérence des données
const validateStats = stats => {
  return stats.cpuUsage >= 0 && stats.cpuUsage <= 100 && stats.memory?.heapUsedMB > 0 && stats.timestamp && Array.isArray(stats.history);
};
```

## 🎉 Résultat attendu

- ✅ Interface fluide sans clignotement
- ✅ Données mises à jour en temps réel
- ✅ Indicateurs visuels clairs
- ✅ Performance optimisée
- ✅ Gestion d'erreur robuste

## 📚 Ressources

- **Code source** : `src/app/admin/settings/page.js`
- **API** : `src/app/api/admin/system-stats/route.js`
- **Tests** : `scripts/test-auto-update.js`
- **Documentation graphiques** : `docs/CHARTS_GUIDE.md`
