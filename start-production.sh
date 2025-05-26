#!/bin/bash

# Script de démarrage pour la production CollabWave

echo "🚀 Démarrage de CollabWave en mode production..."

# Vérifier que les variables d'environnement essentielles sont définies
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Erreur: JWT_SECRET n'est pas définie"
    exit 1
fi

# Définir les variables par défaut si elles ne sont pas définies
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "📦 Configuration:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - HOSTNAME: $HOSTNAME"
echo "  - NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"

# Construire l'application si nécessaire
if [ ! -d ".next" ]; then
    echo "🔨 Construction de l'application..."
    npm run build
fi

# Appliquer les migrations Prisma
echo "🗄️ Application des migrations de base de données..."
npx prisma migrate deploy

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Démarrer le serveur
echo "🚀 Démarrage du serveur..."
node server.js 