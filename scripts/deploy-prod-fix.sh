#!/bin/bash

# Script de déploiement des correctifs en production
# Utilisation: ./scripts/deploy-prod-fix.sh

echo "🚀 Déploiement des correctifs en production..."
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Étape 1: Vérifier les fichiers nécessaires
print_step "Vérification des fichiers..."

if [ ! -f "public/sw.prod-disabled.js" ]; then
    print_error "Fichier sw.prod-disabled.js manquant. Exécutez: npm run disable-sw-prod"
    exit 1
fi

if [ ! -f "DESACTIVER_SW_PRODUCTION.md" ]; then
    print_error "Guide de déploiement manquant."
    exit 1
fi

print_success "Tous les fichiers sont présents"

# Étape 2: Afficher les instructions de déploiement
print_step "Instructions de déploiement en production:"

echo ""
echo "🔧 ÉTAPES À SUIVRE SUR VOTRE SERVEUR DE PRODUCTION:"
echo ""
echo "1️⃣  Connectez-vous à votre serveur:"
echo "    ssh votre-utilisateur@votre-serveur"
echo ""
echo "2️⃣  Allez dans le dossier de votre application:"
echo "    cd /chemin/vers/votre/app"
echo ""
echo "3️⃣  Désactivez le Service Worker:"
echo "    cp public/sw.prod-disabled.js public/sw.js"
echo ""
echo "4️⃣  Mettez à jour la DATABASE_URL (si pas encore fait):"
echo "    # Éditez votre fichier .env et remplacez:"
echo "    DATABASE_URL=\"postgres://postgres:GqLeiEaKAHmmjfQ0ipQ2pyJScVfS6xiUnezkWu25dtKMBQFuNG7q9UggZQis47Nr@147.79.101.194:7879/postgres?connection_limit=20&pool_timeout=20&connect_timeout=60&socket_timeout=60&sslmode=require\""
echo ""
echo "5️⃣  Redémarrez l'application:"
echo "    pm2 restart all"
echo "    # ou votre méthode de redémarrage"
echo ""

# Étape 3: Créer un script de déploiement pour le serveur
print_step "Création du script de déploiement pour le serveur..."

cat > deploy-server.sh << 'EOF'
#!/bin/bash

# Script à exécuter sur le serveur de production
echo "🚀 Application des correctifs CollabWave..."

# Sauvegarder l'ancien SW
if [ -f "public/sw.js" ] && [ ! -f "public/sw.backup.js" ]; then
    cp public/sw.js public/sw.backup.js
    echo "✅ Service Worker sauvegardé"
fi

# Désactiver le Service Worker
cat > public/sw.js << 'SWEOF'
// Service Worker de désactivation - Production
console.log('🚫 [PRODUCTION] Service Worker désactivé - Nettoyage automatique')

self.addEventListener('install', (event) => {
  console.log('🧹 [PRODUCTION] Désinstallation du Service Worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🗑️ [PRODUCTION] Nettoyage des caches...')
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ [PRODUCTION] Suppression du cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('✅ [PRODUCTION] Service Worker désactivé et caches nettoyés')
      return self.registration.unregister().then(() => {
        console.log('✅ [PRODUCTION] Service Worker désenregistré')
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_DISABLED',
              message: 'Service Worker désactivé, rechargement automatique'
            })
          })
        })
      })
    })
  )
})

self.addEventListener('fetch', (event) => {
  return
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
SWEOF

echo "✅ Service Worker désactivé"

# Vérifier si PM2 est disponible
if command -v pm2 &> /dev/null; then
    echo "🔄 Redémarrage avec PM2..."
    pm2 restart all
    echo "✅ Application redémarrée avec PM2"
else
    echo "⚠️  PM2 non trouvé. Redémarrez manuellement votre application."
fi

echo ""
echo "🎉 Correctifs appliqués avec succès !"
echo "🔍 Testez votre site: https://todo.chghosts.fr"
echo "📊 Health check: https://todo.chghosts.fr/api/health"
EOF

chmod +x deploy-server.sh
print_success "Script de déploiement créé: deploy-server.sh"

# Étape 4: Résumé
echo ""
print_step "RÉSUMÉ DES ACTIONS:"
echo ""
print_success "✅ Service Worker de désactivation préparé"
print_success "✅ Script de déploiement créé (deploy-server.sh)"
print_success "✅ Guide de déploiement disponible (DESACTIVER_SW_PRODUCTION.md)"
echo ""
print_warning "📋 PROCHAINES ÉTAPES:"
echo "   1. Copiez deploy-server.sh sur votre serveur"
echo "   2. Exécutez-le: ./deploy-server.sh"
echo "   3. Testez votre application"
echo ""
print_success "🎯 Après ces étapes, plus d'erreurs 503 ni de messages d'annulation !"

echo ""
echo "📞 Support: Consultez DESACTIVER_SW_PRODUCTION.md pour plus de détails" 