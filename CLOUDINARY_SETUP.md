# Configuration Cloudinary pour les Images de Profil

## Pourquoi Cloudinary ?

En production, les serveurs comme Vercel ont un système de fichiers éphémère. Les fichiers uploadés dans `/public/uploads/` sont supprimés à chaque redéploiement. Cloudinary résout ce problème en stockant les images dans le cloud.

## Étapes de configuration

### 1. Créer un compte Cloudinary

1. Allez sur [https://cloudinary.com](https://cloudinary.com)
2. Créez un compte gratuit (10GB de stockage et 25,000 transformations/mois)
3. Confirmez votre email

### 2. Récupérer vos identifiants

1. Connectez-vous à votre dashboard Cloudinary
2. Sur la page d'accueil, vous verrez vos identifiants :
   - **Cloud Name** (nom du cloud)
   - **API Key** (clé API)
   - **API Secret** (secret API)

### 3. Configurer les variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"
```

### 4. Configuration pour la production (Vercel)

1. Allez dans votre projet Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Ajoutez les trois variables :
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Avantages de cette solution

✅ **Persistance** : Les images restent disponibles après les redéploiements ✅ **Performance** : CDN global pour un chargement rapide ✅ **Optimisation** : Redimensionnement et compression automatiques ✅ **Sécurité** : URLs sécurisées et gestion des accès ✅ **Gratuit** : Plan gratuit généreux pour la plupart des projets

## Fonctionnalités implémentées

- Upload d'images avec validation (type et taille)
- Redimensionnement automatique (400x400px)
- Optimisation de qualité
- Suppression des anciennes images
- Gestion d'erreurs complète

## Formats supportés

- JPEG/JPG
- PNG
- WebP

## Limites

- Taille maximum : 5MB par image
- Plan gratuit : 10GB de stockage total
