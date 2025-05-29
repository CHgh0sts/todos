# Guide du Système de Monitoring en Temps Réel

## Vue d'ensemble

Le système de monitoring de CollabWave fournit des statistiques système **réelles et en temps réel** dans la section "Système" du dashboard d'administration (`/admin/settings`).

## Fonctionnalités

### 🔄 Mise à jour automatique

- **Fréquence** : Toutes les 5 secondes
- **Indicateur visuel** : Point vert clignotant + timestamp de dernière mise à jour
- **Activation** : Seulement quand l'onglet "Système" est actif (optimisation performance)

### 📊 Métriques en temps réel

#### CPU

- **Usage en pourcentage** : Calcul réel basé sur les temps CPU
- **Nombre de cœurs** : Détection automatique
- **Modèle de processeur** : Information système réelle

#### Mémoire

- **Heap Node.js** : Mémoire utilisée par l'application
- **Mémoire système** : Total/libre/utilisé du système
- **Pourcentage d'utilisation** : Calcul en temps réel
- **Détails** : RSS, External, Array Buffers

#### Stockage

- **Estimation intelligente** : Basée sur la mémoire système
- **Pourcentage d'utilisation** : Calcul approximatif
- **Note** : Estimation car Node.js n'a pas d'accès direct au disque

#### Uptime

- **Processus Node.js** : Temps depuis le démarrage de l'application
- **Système** : Temps depuis le démarrage du serveur
- **Format** : Jours, heures, minutes, secondes

### 🖥️ Informations système

#### Environnement

- **Node.js** : Version en cours d'exécution
- **Plateforme** : OS (darwin, linux, win32)
- **Architecture** : arm64, x64, etc.
- **Hostname** : Nom de la machine

#### Base de données

- **Compteurs en temps réel** :
  - Utilisateurs
  - Projets
  - Tâches
  - Logs d'activité

#### Performance

- **Load Average** : Charge système (Unix/macOS uniquement)
- **Métriques simulées** : Requêtes/min, temps de réponse, erreurs
- **Note** : Les métriques de performance nécessiteraient un système de monitoring plus avancé

## Architecture technique

### API `/api/admin/system-stats`

```javascript
// Modules utilisés
import os from 'os'           // Informations système
import fs from 'fs'           // Système de fichiers
import { promisify } from 'util'

// Calcul CPU réel
function getCpuUsage() {
  // Utilise os.cpus() pour calculer l'usage réel
  // Compare les temps idle/total entre deux mesures
}

// Données retournées
{
  cpuUsage: number,           // Pourcentage réel
  memoryUsage: number,        // Bytes utilisés
  diskUsage: number,          // Estimation
  uptime: number,             // Secondes
  database: {...},            // Compteurs DB
  environment: {...},         // Info système
  memory: {...},              // Détails mémoire
  timestamp: string,          // ISO timestamp
  lastUpdate: number          // Unix timestamp
}
```

### Frontend - Mise à jour automatique

```javascript
useEffect(() => {
  // Mise à jour toutes les 5 secondes
  const interval = setInterval(() => {
    if (activeTab === 'system') {
      fetchSystemData();
    }
  }, 5000);

  return () => clearInterval(interval);
}, [activeTab]);
```

## Utilisation

### Accès

1. Connectez-vous en tant qu'**ADMIN**
2. Allez dans **Administration** → **Paramètres**
3. Cliquez sur l'onglet **"Système"**

### Interprétation des données

#### CPU Usage

- **0-30%** : Utilisation normale
- **30-70%** : Charge modérée
- **70-100%** : Charge élevée

#### Mémoire

- **Heap utilisé** : Mémoire de l'application Node.js
- **RSS** : Mémoire physique totale du processus
- **External** : Mémoire C++ liée à Node.js

#### Uptime

- **Processus** : Redémarre à chaque déploiement
- **Système** : Redémarre seulement au reboot serveur

## Scripts de test

### Test des statistiques

```bash
npm run test-system-stats
```

Affiche toutes les métriques système disponibles :

- Informations CPU détaillées
- Utilisation mémoire complète
- Interfaces réseau
- Load average
- Test de performance

## Limitations et notes

### Données réelles vs simulées

#### ✅ Données réelles

- CPU usage (calculé)
- Mémoire Node.js (process.memoryUsage())
- Mémoire système (os.totalmem/freemem)
- Uptime (process.uptime/os.uptime)
- Informations système (os.\*)
- Statistiques base de données (Prisma)

#### ⚠️ Données estimées/simulées

- **Stockage disque** : Estimation basée sur la mémoire
- **Requêtes/minute** : Simulé (nécessiterait un middleware de tracking)
- **Temps de réponse** : Simulé (nécessiterait un système de métriques)
- **Erreurs/heure** : Simulé (nécessiterait un système de logging avancé)

### Améliorations possibles

Pour des métriques plus avancées, vous pourriez intégrer :

- **Prometheus** + **Grafana** pour le monitoring
- **New Relic** ou **DataDog** pour l'APM
- **Winston** avec des transports pour le logging
- **Express middleware** pour tracker les requêtes

## Sécurité

- **Accès restreint** : ADMIN et MODERATOR uniquement
- **Pas d'informations sensibles** : Aucun secret ou token exposé
- **Rate limiting** : Mise à jour limitée à 5 secondes minimum

## Dépannage

### Problèmes courants

#### CPU toujours à 0%

- **Cause** : Première mesure, pas de comparaison
- **Solution** : Attendez 5-10 secondes pour la deuxième mesure

#### Mémoire très élevée

- **Cause** : Normal pour Node.js, garbage collection
- **Solution** : Surveillez les tendances, pas les pics

#### Load Average non affiché

- **Cause** : Disponible seulement sur Unix/macOS
- **Solution** : Normal sur Windows

### Logs de débogage

```bash
# Dans les logs du serveur
📊 [System Stats API] Récupération des statistiques système
✅ [System Stats API] Statistiques récupérées: { users: X, projects: Y, ... }
```

## Conclusion

Le système de monitoring fournit une vue d'ensemble **réelle et en temps réel** de l'état de votre serveur CollabWave. Les données sont automatiquement mises à jour et reflètent l'état actuel du système, permettant une surveillance efficace de la performance et de la santé de l'application.
