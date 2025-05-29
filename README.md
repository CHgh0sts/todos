# 🚀 CollabWave - Gestion de Projets Collaboratifs

Une application moderne de gestion de projets et tâches collaboratives construite avec **Next.js**, **PostgreSQL**, **Prisma** et **Tailwind CSS**.

## ✨ Fonctionnalités

### 🎯 Gestion de Projets

- **Projets personnalisables** avec couleurs et emojis
- **Système de collaboration** avec permissions granulaires
- **Invitations par email** avec acceptation/refus
- **Notifications automatiques** pour tous les événements

### 🎯 Gestion des Tâches

- ✅ Création, modification et suppression de tâches
- ✅ Organisation par projets et catégories
- ✅ Système de priorités et dates d'échéance
- ✅ Statuts personnalisables (À faire, En cours, Terminé)

### 👥 Collaboration

- **Trois niveaux de permissions** :
  - `view` : Lecture seule
  - `edit` : Modification des todos
  - `admin` : Gestion complète du projet
- **Partage de projets** avec invitations
- **Suivi des modifications** avec notifications
- ✅ Partage de projets entre utilisateurs
- ✅ Système d'invitations par email
- ✅ Liens de partage temporaires
- ✅ Gestion des permissions (Propriétaire, Éditeur, Lecteur)
- ✅ Notifications en temps réel

### 🔐 Authentification & Sécurité

- ✅ Inscription et connexion sécurisées
- ✅ Vérification par email
- ✅ Réinitialisation de mot de passe
- ✅ Gestion des sessions
- ✅ Protection CSRF et validation des données

### 👑 Administration

- ✅ Dashboard d'administration complet
- ✅ Gestion des utilisateurs et rôles (USER, MODERATOR, ADMIN)
- ✅ Statistiques système en temps réel avec mises à jour automatiques
- ✅ Graphiques interactifs et historique des métriques
- ✅ Logs d'activité et monitoring
- ✅ Mode maintenance
- ✅ Outils de sauvegarde et export

### 📊 Monitoring & Analytics

- ✅ Métriques système en temps réel (CPU, mémoire, disque)
- ✅ Graphiques interactifs avec filtres temporels
- ✅ Historique des performances (100 points max)
- ✅ Mises à jour automatiques toutes les 5 secondes
- ✅ 8 métriques différentes disponibles
- ✅ Interface sans clignotement lors des mises à jour

### 🎨 Interface Utilisateur

- **Design moderne** avec Tailwind CSS
- **Mode sombre/clair** automatique ou manuel
- **Interface responsive** pour mobile et desktop
- **Animations fluides** et notifications toast
- ✅ Design moderne et responsive
- ✅ Mode sombre/clair
- ✅ Interface intuitive
- ✅ Notifications toast
- ✅ Animations fluides

## 🛠️ Technologies

- **Frontend** : Next.js 14, React, Tailwind CSS
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : JWT avec bcryptjs
- **UI/UX** : Composants modaux, toasts, thèmes

## 📦 Installation

1. **Cloner le projet**

```bash
git clone <url-du-repo>
cd collabwave
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer la base de données**

```bash
# Créer le fichier .env avec votre URL PostgreSQL
echo 'DATABASE_URL="postgres://user:password@host:port/database"' > .env
echo 'JWT_SECRET="votre_jwt_secret_securise"' >> .env
echo 'NODE_ENV="development"' >> .env
```

4. **Configurer l'envoi d'emails** (optionnel mais recommandé)

```bash
# Ajouter la configuration SMTP à votre .env
echo 'SMTP_HOST="smtp.gmail.com"' >> .env
echo 'SMTP_PORT="465"' >> .env
echo 'SMTP_USER="votre-email@gmail.com"' >> .env
echo 'SMTP_PASS="votre-mot-de-passe-application"' >> .env
echo 'NEXT_PUBLIC_APP_URL="http://localhost:3000"' >> .env
```

**Note** : Pour Gmail, utilisez un [mot de passe d'application](https://support.google.com/accounts/answer/185833) au lieu de votre mot de passe principal.

**Tester la configuration email** :

```bash
npm run test:email votre@email.com
```

5. **Appliquer les migrations**

```bash
npx prisma migrate dev
```

6. **Générer le client Prisma**

```bash
npx prisma generate
```

7. **Peupler avec des données de test** (optionnel)

```bash
npm run db:seed
```

8. **Démarrer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗃️ Base de Données

### Modèles Principaux

- **User** : Utilisateurs avec authentification
- **Project** : Projets avec métadonnées (couleur, emoji, description)
- **ProjectShare** : Partages de projets avec permissions
- **Todo** : Tâches liées aux projets
- **Category** : Catégories de tâches (globales ou par projet)
- **Invitation** : Invitations de collaboration
- **Notification** : Notifications utilisateur

### Scripts Utiles

```bash
# Voir la base de données
npx prisma studio

# Réinitialiser la base de données
npx prisma migrate reset

# Appliquer les changements de schéma
npx prisma db push

# Peupler avec des données de test
npm run db:seed
```

## 🔐 Authentification

### Compte de Test

Après avoir exécuté le seed :

- **Email** : `test@example.com`
- **Mot de passe** : `password123`

### Création de Compte

Vous pouvez créer un nouveau compte via l'interface `/auth/register`.

## 🚀 Déploiement

### Variables d'Environnement

```env
DATABASE_URL="postgres://user:password@host:port/database"
JWT_SECRET="votre_jwt_secret_en_production"
NODE_ENV="production"
```

### Build de Production

```bash
npm run build
npm start
```

## 📁 Structure du Projet

```
├── src/
│   ├── app/                 # Pages Next.js 14 (App Router)
│   │   ├── api/            # Routes API
│   │   ├── auth/           # Pages d'authentification
│   │   ├── projects/       # Page de gestion des projets
│   │   ├── todos/[projectId]/ # Pages de todos par projet
│   │   └── categories/     # Gestion des catégories
│   ├── components/         # Composants React réutilisables
│   ├── contexts/          # Contexts React (Auth, Theme)
│   └── lib/               # Utilitaires (Prisma, Auth)
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   ├── migrations/        # Migrations PostgreSQL
│   └── seed.js           # Script de données de test
└── public/               # Assets statiques
```

## 🔄 Migration depuis SQLite

Ce projet a été migré de SQLite vers PostgreSQL. Les principales différences :

- **Types de données** : `SERIAL` au lieu de `AUTOINCREMENT`
- **Performance** : Meilleure pour les applications collaboratives
- **Fonctionnalités** : Support complet des contraintes et relations
- **Scalabilité** : Prêt pour la production

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ et Next.js 14**

## 🌐 Accès Réseau Local

### Accès depuis d'autres appareils

Pour accéder à CollabWave depuis votre téléphone, tablette ou autre ordinateur sur le même réseau WiFi :

```bash
# 1. Démarrez le serveur
npm run dev

# 2. Obtenez votre IP locale et un QR code
npm run network-info

# 3. Testez la connectivité
npm run test-network
```

Le serveur affichera automatiquement :

- 🏠 **Accès local :** `http://localhost:3000`
- 🌐 **Accès réseau :** `http://[VOTRE_IP]:3000`

### Configuration Automatique

- ✅ **CORS configuré** pour les réseaux locaux (192.168.x.x, 10.x.x.x, 172.x.x.x)
- ✅ **Socket.IO** fonctionne sur le réseau local
- ✅ **QR Code** généré automatiquement pour mobile
- ✅ **Tests de connectivité** intégrés

### Dépannage

Si l'accès réseau ne fonctionne pas :

1. **Vérifiez le pare-feu** (peut bloquer le port 3000)
2. **Même réseau WiFi** requis pour tous les appareils
3. **Utilisez l'IP exacte** affichée par le serveur

📖 **Guide complet :** [docs/NETWORK_ACCESS_GUIDE.md](docs/NETWORK_ACCESS_GUIDE.md)
