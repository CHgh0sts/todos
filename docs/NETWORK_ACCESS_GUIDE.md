# Guide d'Accès Réseau Local - CollabWave

## 🎯 Objectif

Ce guide vous explique comment accéder à votre application CollabWave depuis d'autres appareils sur votre réseau local (téléphone, tablette, autre ordinateur).

## 🚀 Configuration Automatique

### Démarrage du Serveur

```bash
npm run dev
```

Le serveur affichera automatiquement :

- 🏠 **Accès local :** `http://localhost:3000`
- 🌐 **Accès réseau :** `http://[VOTRE_IP]:3000`

### Obtenir les Informations Réseau

```bash
npm run network-info
```

Cette commande affiche :

- Votre adresse IP locale
- Un QR code pour accès mobile
- Instructions de dépannage

## 📱 Accès depuis un Autre Appareil

### Étapes Simples

1. **Même réseau WiFi** : Assurez-vous que tous les appareils sont connectés au même réseau WiFi
2. **Adresse IP** : Utilisez l'adresse affichée par le serveur (ex: `http://192.168.1.100:3000`)
3. **Navigateur** : Ouvrez un navigateur sur l'autre appareil et saisissez l'adresse

### QR Code (Mobile)

- Scannez le QR code affiché par `npm run network-info`
- Ou utilisez l'appareil photo de votre téléphone pour scanner le code dans le terminal

## 🔧 Configuration Technique

### Modifications Apportées

#### 1. **Serveur (server.js)**

```javascript
// Écoute sur toutes les interfaces réseau
const hostname = '0.0.0.0';

// Origines CORS autorisées pour le réseau local
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[IP_LOCALE]:3000',
  // Regex pour toutes les IPs du réseau local
  /^http:\/\/192\.168\.\d+\.\d+:3000$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:3000$/
];
```

#### 2. **Socket.IO**

Le Socket.IO est configuré pour accepter les connexions depuis le réseau local avec les mêmes origines CORS.

## 🛠️ Dépannage

### Problème : "Site inaccessible"

#### Sur macOS

1. **Pare-feu système :**

   - Préférences Système > Sécurité et confidentialité > Pare-feu
   - Cliquez sur "Options du pare-feu"
   - Ajoutez Node.js ou désactivez temporairement

2. **Commande terminal :**
   ```bash
   sudo pfctl -d  # Désactive temporairement le pare-feu
   ```

#### Sur Windows

1. **Pare-feu Windows :**

   - Panneau de configuration > Système et sécurité > Pare-feu Windows Defender
   - "Autoriser une application via le Pare-feu Windows Defender"
   - Ajoutez Node.js ou le port 3000

2. **Commande PowerShell (Admin) :**
   ```powershell
   New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Protocol TCP -LocalPort 3000
   ```

#### Sur Linux

```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

### Problème : "Connexion refusée"

#### Vérifications

1. **Serveur démarré :** Le serveur doit afficher "Serveur prêt sur http://0.0.0.0:3000"
2. **Même réseau :** Vérifiez que les appareils sont sur le même WiFi
3. **IP correcte :** Utilisez l'IP affichée par le serveur, pas une IP aléatoire

#### Test de Connectivité

```bash
# Depuis un autre appareil (si possible)
ping [IP_DE_VOTRE_PC]

# Ou depuis votre PC
curl http://[VOTRE_IP]:3000
```

### Problème : "CORS Error"

Si vous voyez des erreurs CORS dans la console du navigateur :

1. **Vérifiez l'IP :** L'IP utilisée doit correspondre à celle détectée automatiquement
2. **Redémarrez le serveur :** `npm run dev` pour recharger la configuration CORS
3. **Cache navigateur :** Videz le cache du navigateur mobile

## 📊 Réseaux Supportés

### Plages d'IP Automatiquement Autorisées

- **Classe A :** `10.0.0.0/8` (10.x.x.x)
- **Classe B :** `172.16.0.0/12` (172.16.x.x - 172.31.x.x)
- **Classe C :** `192.168.0.0/16` (192.168.x.x)

### Types de Réseaux

- ✅ **WiFi domestique** (192.168.x.x)
- ✅ **Réseau d'entreprise** (10.x.x.x ou 172.x.x.x)
- ✅ **Hotspot mobile** (192.168.x.x)
- ❌ **Réseaux publics** (sécurité)

## 🔒 Sécurité

### Bonnes Pratiques

- **Réseau privé uniquement :** N'exposez jamais sur Internet sans HTTPS
- **Pare-feu :** Gardez le pare-feu activé, ajoutez juste une exception
- **Développement seulement :** Cette configuration est pour le développement local

### Limitations

- Accès limité au réseau local
- Pas de HTTPS (utilisation en développement uniquement)
- Authentification requise pour accéder aux fonctionnalités

## 📱 Utilisation Mobile

### Fonctionnalités Supportées

- ✅ **Navigation complète** de l'application
- ✅ **Authentification** et gestion de compte
- ✅ **Projets et tâches** en temps réel
- ✅ **Collaboration** avec Socket.IO
- ✅ **Mode sombre** automatique
- ✅ **Interface responsive** optimisée mobile

### Conseils Mobile

- **Ajout à l'écran d'accueil :** Possible via le navigateur
- **Notifications :** Fonctionnent via le navigateur
- **Hors ligne :** Limitée (PWA basique)

## 🚀 Commandes Utiles

```bash
# Informations réseau complètes
npm run network-info

# Démarrage serveur réseau
npm run dev

# Test de connectivité locale
npm run check-localhost

# Vérification des ports ouverts (macOS/Linux)
netstat -an | grep 3000

# Vérification IP locale
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 📞 Support

### Logs Utiles

Le serveur affiche automatiquement :

- IP locale détectée
- Origines CORS autorisées
- État des connexions Socket.IO

### Problèmes Courants

1. **IP change :** Redémarrez le serveur si votre IP change
2. **Multiple WiFi :** Assurez-vous d'utiliser la bonne interface réseau
3. **VPN actif :** Peut interférer avec la détection d'IP

---

**Note :** Cette configuration est optimisée pour le développement local. Pour la production, utilisez HTTPS et une configuration sécurisée appropriée.
