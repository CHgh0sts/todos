# 🚨 Instructions pour Corriger la Production

## 🎯 Problème Identifié

Votre application **locale** fonctionne parfaitement maintenant, mais la **production** a encore des erreurs de connexion à la base de données car elle n'utilise pas la configuration optimisée.

## ✅ Solution : Mettre à Jour la Configuration Production

### 1. **Connectez-vous à votre serveur de production**

```bash
ssh votre-utilisateur@votre-serveur-production
```

### 2. **Sauvegardez la configuration actuelle**

```bash
cp .env .env.backup
```

### 3. **Modifiez le fichier .env sur le serveur**

Remplacez cette ligne dans votre fichier `.env` de production :

**❌ ANCIEN (problématique) :**

```bash
DATABASE_URL="postgres://postgres:GqLeiEaKAHmmjfQ0ipQ2pyJScVfS6xiUnezkWu25dtKMBQFuNG7q9UggZQis47Nr@147.79.101.194:7879/postgres"
```

**✅ NOUVEAU (optimisé) :**

```bash
DATABASE_URL="postgres://postgres:GqLeiEaKAHmmjfQ0ipQ2pyJScVfS6xiUnezkWu25dtKMBQFuNG7q9UggZQis47Nr@147.79.101.194:7879/postgres?connection_limit=20&pool_timeout=20&connect_timeout=60&socket_timeout=60&sslmode=require"
```

### 4. **Vérifiez aussi ces variables dans votre .env de production :**

```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://todo.chghosts.fr"
NEXTAUTH_URL="https://todo.chghosts.fr"
```

### 5. **Redémarrez votre application**

```bash
# Si vous utilisez PM2
pm2 restart all

# Si vous utilisez systemd
sudo systemctl restart votre-service

# Si vous utilisez Docker
docker-compose restart

# Ou simplement
pkill -f "node server.js" && npm run start
```

## 🔍 **Vérification**

Après le redémarrage, vérifiez que tout fonctionne :

1. **Testez l'API de santé :**

   ```bash
   curl https://todo.chghosts.fr/api/health
   ```

2. **Vérifiez les logs :** Plus d'erreurs de connexion à `147.79.101.194:7879`

3. **Testez la connexion :** Vous devriez pouvoir vous connecter sans problème

## 📊 **Optimisations Appliquées**

- **Pool de connexions** : 20 connexions max (au lieu de 5)
- **Timeouts optimisés** : 60 secondes pour les connexions
- **SSL requis** : Sécurité renforcée
- **Cache intelligent** : Déjà déployé dans le code

## 🚨 **Si le problème persiste**

1. Vérifiez que votre serveur de base de données accepte 20 connexions
2. Surveillez les logs pour d'autres erreurs
3. Testez avec `connection_limit=10` si 20 est trop élevé

## 📞 **Support**

Si vous avez besoin d'aide pour appliquer ces changements, n'hésitez pas à demander !
