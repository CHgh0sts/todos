# Système d'Images de Profil - Stockage en Base64

## 🎯 Solution choisie

Au lieu d'utiliser un service externe comme Cloudinary, nous stockons les images de profil directement en **base64** dans la base de données PostgreSQL.

## ✅ Avantages

- **Aucune dépendance externe** : Pas besoin de compte tiers
- **Simplicité** : Tout est géré en interne
- **Fiabilité** : Fonctionne en développement et production
- **Gratuit** : Aucun coût supplémentaire
- **Sécurité** : Les images sont liées à l'utilisateur en base

## 📋 Comment ça fonctionne

### 1. Upload d'image

```javascript
// L'image est convertie en base64
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64 = buffer.toString('base64');
const dataUrl = `data:${file.type};base64,${base64}`;

// Stockée directement en base
await prisma.user.update({
  where: { id: userId },
  data: { profileImage: dataUrl }
});
```

### 2. Affichage

```javascript
// L'image est directement utilisable dans un <img>
<img src={user.profileImage} alt="Photo de profil" />
```

## 🔧 Limitations et considérations

### Taille des images

- **Limite actuelle** : 5MB par image
- **Recommandation** : Optimiser les images avant upload
- **Impact base** : Les images en base64 sont ~33% plus volumineuses

### Performance

- **Avantage** : Pas de requête HTTP supplémentaire
- **Inconvénient** : Taille des réponses API plus importante
- **Optimisation** : Les images sont mises en cache par le navigateur

### Base de données

- **PostgreSQL** : Gère très bien les données binaires
- **Indexation** : Le champ `profileImage` n'est pas indexé (normal)
- **Sauvegarde** : Les images sont incluses dans les backups

## 🚀 Utilisation

### Upload d'une image

```javascript
const formData = new FormData();
formData.append('profileImage', file);

const response = await fetch('/api/user/profile-image', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});
```

### Suppression d'une image

```javascript
const response = await fetch('/api/user/profile-image', {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});
```

### Affichage avec le composant UserAvatar

```javascript
import UserAvatar from '@/components/UserAvatar';

<UserAvatar user={user} size="md" />;
```

## 🔄 Migration depuis Cloudinary

Si vous aviez des images sur Cloudinary :

1. Les anciennes URLs continuent de fonctionner
2. Les nouvelles images sont stockées en base64
3. Pas de migration automatique nécessaire

## 📊 Comparaison des solutions

| Critère         | Base64 | Cloudinary | Stockage fichier |
| --------------- | ------ | ---------- | ---------------- |
| Simplicité      | ✅     | ❌         | ⚠️               |
| Coût            | ✅     | ❌         | ✅               |
| Performance     | ⚠️     | ✅         | ⚠️               |
| Fiabilité prod  | ✅     | ✅         | ❌               |
| Transformations | ❌     | ✅         | ❌               |

## 🛠️ Maintenance

### Nettoyage des anciennes images

```sql
-- Voir la taille des images en base
SELECT
  COUNT(*) as users_with_images,
  AVG(LENGTH(profile_image)) as avg_size_bytes
FROM users
WHERE profile_image IS NOT NULL;
```

### Optimisation future

Si la base devient trop volumineuse, possibilité de :

1. Compresser les images côté client
2. Limiter la résolution (ex: 400x400px max)
3. Migrer vers un CDN si nécessaire

## 🎨 Interface utilisateur

Le composant `UserAvatar` gère automatiquement :

- Affichage de l'image si disponible
- Fallback sur la première lettre du nom
- Différentes tailles (sm, md, lg, xl)
- Mode sombre/clair
- Responsive design
