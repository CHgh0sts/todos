# Guide des Graphiques de Monitoring

## Vue d'ensemble

Le système de monitoring de CollabWave inclut maintenant des **graphiques en temps réel** pour visualiser l'évolution des métriques système. Cette fonctionnalité permet un suivi visuel des performances et des tendances.

## Types de graphiques

### 🔸 Mini-graphiques

**Emplacement** : Sous chaque métrique dans les cartes de statistiques

**Caractéristiques** :

- Affichent les **20 derniers points** de données
- Mise à jour automatique toutes les 5 secondes
- Graphiques linéaires simples et épurés
- Couleurs coordonnées avec les icônes des métriques

**Métriques disponibles** :

- **CPU Usage** (bleu) : Évolution du pourcentage d'utilisation CPU
- **Mémoire** (vert) : Consommation mémoire en MB
- **Stockage** (violet) : Utilisation disque estimée
- **Requêtes** (orange) : Nombre de requêtes par minute

### 📊 Graphique détaillé

**Emplacement** : Section complète en bas de l'onglet "Système"

**Fonctionnalités avancées** :

- **Filtres temporels** : 5min, 15min, 30min, 1h, Tout
- **Sélection de métriques** : Activez/désactivez les courbes
- **Tooltip interactif** : Valeurs précises au survol
- **Légende dynamique** : Identification des courbes
- **Statistiques** : Points de données, période, métriques actives

## Métriques disponibles

### 📈 Métriques principales

| Métrique         | Couleur   | Unité | Description                   |
| ---------------- | --------- | ----- | ----------------------------- |
| **CPU Usage**    | 🔵 Bleu   | %     | Pourcentage d'utilisation CPU |
| **Mémoire (MB)** | 🟢 Vert   | MB    | Mémoire heap Node.js utilisée |
| **Mémoire (%)**  | 🟣 Violet | %     | Pourcentage mémoire système   |
| **Disque (GB)**  | 🟡 Jaune  | GB    | Estimation utilisation disque |
| **Disque (%)**   | 🔴 Rouge  | %     | Pourcentage disque utilisé    |

### 📊 Métriques de performance

| Métrique          | Couleur   | Unité | Description                   |
| ----------------- | --------- | ----- | ----------------------------- |
| **Requêtes/min**  | 🔷 Cyan   | /min  | Nombre de requêtes par minute |
| **Temps réponse** | 🟢 Lime   | ms    | Temps de réponse moyen        |
| **Erreurs/h**     | 🟠 Orange | /h    | Nombre d'erreurs par heure    |

## Utilisation

### Accès aux graphiques

1. **Connexion** : Connectez-vous en tant qu'ADMIN
2. **Navigation** : Administration → Paramètres
3. **Onglet** : Cliquez sur "Système"
4. **Visualisation** : Les graphiques s'affichent automatiquement

### Interaction avec le graphique détaillé

#### Filtres temporels

```
• 5 min    : 60 points (5 dernières minutes)
• 15 min   : 180 points (15 dernières minutes)
• 30 min   : 360 points (30 dernières minutes)
• 1 heure  : 720 points (1 dernière heure)
• Tout     : Tous les points disponibles (max 100)
```

#### Sélection de métriques

- **Cliquez** sur un bouton de métrique pour l'activer/désactiver
- **Couleur** : Le bouton prend la couleur de la métrique quand active
- **Multiple** : Vous pouvez afficher plusieurs métriques simultanément

#### Tooltip et navigation

- **Survol** : Passez la souris sur le graphique pour voir les valeurs
- **Zoom** : Utilisez les filtres temporels pour zoomer
- **Légende** : Cliquez sur la légende pour masquer/afficher une courbe

## Architecture technique

### Stockage des données

```javascript
// Historique en mémoire (production: Redis/DB)
let metricsHistory = []
const MAX_HISTORY_POINTS = 100

// Structure d'un point de données
{
  timestamp: 1703123456789,
  time: "14:30:56",
  cpuUsage: 45.2,
  memoryUsage: 128,
  memoryPercent: 67,
  diskUsage: 8.5,
  diskPercent: 55,
  requestsPerMinute: 150,
  avgResponseTime: 95,
  errorsPerHour: 2
}
```

### Composants React

#### MiniChart

```javascript
import MiniChart from '@/components/ui/MiniChart';

<MiniChart data={systemStats.history} dataKey="cpuUsage" color="#3B82F6" height={40} />;
```

#### DetailedChart

```javascript
import DetailedChart from '@/components/ui/DetailedChart';

<DetailedChart data={systemStats.history} />;
```

### Bibliothèque utilisée

**Recharts** : Bibliothèque de graphiques React

- Installation : `npm install recharts`
- Composants : LineChart, XAxis, YAxis, Tooltip, Legend
- Responsive : S'adapte automatiquement à la taille

## Performance et optimisation

### Gestion de la mémoire

- **Limite** : Maximum 100 points en historique
- **Rotation** : Les anciens points sont supprimés automatiquement
- **Efficacité** : Mise à jour seulement si l'onglet "Système" est actif

### Mise à jour en temps réel

```javascript
// Intervalle de 5 secondes
const interval = setInterval(() => {
  if (activeTab === 'system') {
    fetchSystemData();
  }
}, 5000);
```

### Optimisations frontend

- **Mini-graphiques** : Affichent seulement les 20 derniers points
- **Filtres** : Réduisent le nombre de points affichés
- **Lazy loading** : Les graphiques ne se chargent que si nécessaire

## Interprétation des données

### Patterns normaux

#### CPU Usage

- **0-30%** : Utilisation normale ✅
- **30-70%** : Charge modérée ⚠️
- **70-100%** : Charge élevée ❌

#### Mémoire

- **Croissance graduelle** : Normal (garbage collection)
- **Pics soudains** : Activité intense
- **Plateau élevé** : Possible fuite mémoire

#### Tendances à surveiller

- **CPU** : Pics répétés ou utilisation constamment élevée
- **Mémoire** : Croissance continue sans redescente
- **Erreurs** : Augmentation soudaine du taux d'erreur

### Alertes visuelles

Les graphiques utilisent des couleurs pour indiquer l'état :

- **🟢 Vert** : Normal
- **🟡 Jaune** : Attention
- **🔴 Rouge** : Critique

## Scripts de test

### Test des graphiques

```bash
npm run test-charts
```

**Fonctionnalités** :

- Génère 51 points de données de test
- Simule des variations réalistes
- Affiche les tendances
- Compare avec les données système réelles

### Test des statistiques

```bash
npm run test-system-stats
```

**Utilité** :

- Vérifie les métriques système réelles
- Teste la collecte de données
- Valide les calculs

## Dépannage

### Problèmes courants

#### Graphiques vides

- **Cause** : Pas assez de données collectées
- **Solution** : Attendez quelques minutes pour l'accumulation

#### Données incohérentes

- **Cause** : Redémarrage du serveur (historique en mémoire)
- **Solution** : Normal, les données se reconstituent

#### Performance lente

- **Cause** : Trop de métriques affichées simultanément
- **Solution** : Désactivez certaines métriques dans le graphique détaillé

### Logs de débogage

```bash
# Dans les logs du serveur
✅ [System Stats API] Statistiques récupérées: { ..., historyPoints: 25 }
```

## Améliorations futures

### Fonctionnalités possibles

- **Export** : Télécharger les données en CSV/JSON
- **Alertes** : Notifications sur seuils dépassés
- **Comparaison** : Comparer différentes périodes
- **Prédictions** : Tendances et projections

### Intégrations avancées

- **Prometheus** : Métriques plus détaillées
- **Grafana** : Dashboards professionnels
- **InfluxDB** : Base de données temporelle
- **Webhooks** : Notifications externes

## Conclusion

Les graphiques de monitoring offrent une **visualisation en temps réel** des performances de votre serveur CollabWave. Ils permettent de :

- **Surveiller** les tendances système
- **Identifier** les problèmes rapidement
- **Optimiser** les performances
- **Planifier** les ressources

Utilisez les filtres et la sélection de métriques pour analyser précisément les aspects qui vous intéressent ! 📊
