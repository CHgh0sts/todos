# Configuration de l'URL pour les emails

## Problème résolu

Les emails envoyés par CollabWave (vérification, réinitialisation de mot de passe, invitations) utilisaient `http://localhost:3000` même en production.

## Solution implémentée

Le système détecte maintenant automatiquement l'URL de base selon cette priorité :

1. **Variable explicite** : `NEXT_PUBLIC_APP_URL`
2. **Variables Vercel** : `VERCEL_URL`
3. **Fallback production** : `https://todo.chghosts.fr`
4. **Fallback développement** : `http://localhost:3000`

## Configuration recommandée

### Pour la production

Définissez la variable d'environnement suivante :

```bash
NEXT_PUBLIC_APP_URL="https://todo.chghosts.fr"
```

### Sur Vercel

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez :
   - **Name** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://todo.chghosts.fr`
   - **Environment** : Production

### Sur Railway

1. Allez dans votre projet Railway
2. Variables → Add Variable
3. Ajoutez :
   - **Name** : `NEXT_PUBLIC_APP_URL`
   - **Value** : `https://todo.chghosts.fr`

### Sur d'autres hébergeurs

Ajoutez la variable d'environnement `NEXT_PUBLIC_APP_URL` avec votre domaine.

## Test de la configuration

Utilisez le script de test :

```bash
node scripts/test-email-url.js
```

Ce script affiche :

- Les différents scénarios de détection d'URL
- L'URL qui sera utilisée dans votre environnement actuel
- Des recommandations de configuration

## Vérification en production

1. **Testez une inscription** : L'email de vérification doit contenir `https://todo.chghosts.fr`
2. **Vérifiez les logs** : L'URL utilisée est affichée dans les logs :
   ```
   📧 [Mail] URL de base utilisée: https://todo.chghosts.fr
   📧 [Verification Email] Lien: https://todo.chghosts.fr/auth/verify?token=...
   ```

## Emails concernés

Cette configuration affecte tous les emails :

- ✅ **Vérification de compte** : `/auth/verify?token=...`
- ✅ **Réinitialisation de mot de passe** : `/auth/reset-password?token=...`
- ✅ **Invitations de projet** : `/share/...`
- ✅ **Liens dans le footer** : Accueil, Aide, Contact

## Dépannage

### L'URL est toujours localhost

1. Vérifiez que `NEXT_PUBLIC_APP_URL` est définie en production
2. Redéployez votre application après avoir ajouté la variable
3. Vérifiez les logs pour voir l'URL détectée

### L'URL Vercel automatique ne fonctionne pas

Si vous utilisez un domaine personnalisé, définissez explicitement `NEXT_PUBLIC_APP_URL` car les variables Vercel automatiques pointent vers le domaine `.vercel.app`.

### Test en local

En développement, l'URL sera automatiquement `http://localhost:3000`, ce qui est correct.

## Sécurité

⚠️ **Important** :

- `NEXT_PUBLIC_APP_URL` est une variable publique (accessible côté client)
- Elle doit correspondre exactement à votre domaine de production
- Utilisez toujours HTTPS en production
