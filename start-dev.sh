#!/bin/bash

# Script de démarrage pour le développement local
# Utilisation: ./start-dev.sh

echo "🚀 Démarrage de CollabWave en mode développement local..."

# Vérifier que le fichier .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Erreur: Le fichier .env.local n'existe pas"
    echo "💡 Créez-le avec la commande: npm run test:local"
    exit 1
fi

# Charger les variables d'environnement depuis .env.local
echo "📦 Chargement des variables d'environnement locales..."
export $(cat .env.local | xargs)

# Vérifier les variables critiques
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie dans .env.local"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Erreur: JWT_SECRET n'est pas définie dans .env.local"
    exit 1
fi

echo "✅ Configuration locale chargée:"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "   - JWT_SECRET: ${JWT_SECRET:0:20}..."

# Arrêter tout serveur existant sur le port 3000
echo "🔄 Vérification du port 3000..."
if lsof -ti:3000 > /dev/null; then
    echo "⚠️  Port 3000 occupé, arrêt du processus existant..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 2
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur de développement..."
echo "🌐 L'application sera accessible sur http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo ""
echo "💡 Pour arrêter le serveur: Ctrl+C"
echo ""

# Démarrer avec les variables d'environnement
npm run dev 