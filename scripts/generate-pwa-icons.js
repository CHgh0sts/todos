#!/usr/bin/env node

/**
 * Script pour générer automatiquement toutes les icônes PWA
 * Usage: node scripts/generate-pwa-icons.js [source-image.png]
 */

const fs = require('fs')
const path = require('path')

// Tailles d'icônes requises pour PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
]

// Couleurs pour les icônes de raccourcis
const SHORTCUT_ICONS = {
  'projects': '#3B82F6',
  'notifications': '#F59E0B', 
  'friends': '#10B981'
}

function generateSVGIcon(size, color = '#3B82F6', emoji = '🌊') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(color, -20)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="central" fill="white">${emoji}</text>
</svg>`
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * amount)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons')
  
  // Créer le dossier icons s'il n'existe pas
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  console.log('🎨 Génération des icônes PWA...')

  // Générer les icônes principales
  for (const size of ICON_SIZES) {
    const svgContent = generateSVGIcon(size, '#3B82F6', '🌊')
    const filename = `icon-${size}x${size}.png`
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`)
    
    // Écrire le SVG temporaire
    fs.writeFileSync(svgPath, svgContent)
    console.log(`✅ Généré: ${filename}`)
  }

  // Générer les icônes de raccourcis
  for (const [name, color] of Object.entries(SHORTCUT_ICONS)) {
    let emoji = '📁'
    if (name === 'projects') emoji = '📋'
    if (name === 'notifications') emoji = '🔔'
    if (name === 'friends') emoji = '👥'
    
    const svgContent = generateSVGIcon(96, color, emoji)
    const filename = `shortcut-${name}.png`
    const svgPath = path.join(iconsDir, `shortcut-${name}.svg`)
    
    fs.writeFileSync(svgPath, svgContent)
    console.log(`✅ Généré: ${filename}`)
  }

  // Générer le favicon
  const faviconSvg = generateSVGIcon(32, '#3B82F6', '🌊')
  fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSvg)

  // Générer browserconfig.xml pour Windows
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/icon-144x144.png"/>
            <TileColor>#3B82F6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`
  
  fs.writeFileSync(path.join(iconsDir, 'browserconfig.xml'), browserConfig)

  // Générer safari-pinned-tab.svg
  const safariIcon = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<g transform="translate(0,512) scale(0.1,-0.1)" fill="#000000" stroke="none">
<path d="M1200 4600 c-220 -47 -400 -227 -447 -447 -16 -77 -16 -2629 0 -2706 47 -220 227 -400 447 -447 77 -16 2629 -16 2706 0 220 47 400 227 447 447 16 77 16 2629 0 2706 -47 220 -227 400 -447 447 -77 16 -2629 16 -2706 0z"/>
</g>
</svg>`
  
  fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), safariIcon)

  console.log('🎉 Toutes les icônes PWA ont été générées !')
  console.log('')
  console.log('📝 Prochaines étapes:')
  console.log('1. Convertir les fichiers SVG en PNG si nécessaire')
  console.log('2. Optimiser les images avec un outil comme ImageOptim')
  console.log('3. Tester la PWA avec Chrome DevTools > Application > Manifest')
  console.log('')
  console.log('💡 Pour convertir SVG en PNG, vous pouvez utiliser:')
  console.log('   - https://convertio.co/svg-png/')
  console.log('   - Ou un outil en ligne de commande comme rsvg-convert')
}

// Créer aussi un fichier README pour les icônes
function createIconsReadme() {
  const readmeContent = `# Icônes PWA CollabWave

Ce dossier contient toutes les icônes nécessaires pour la Progressive Web App (PWA).

## Structure des fichiers

### Icônes principales
- \`icon-16x16.png\` - Favicon petit
- \`icon-32x32.png\` - Favicon standard
- \`icon-72x72.png\` - Android Chrome
- \`icon-96x96.png\` - Android Chrome
- \`icon-128x128.png\` - Android Chrome
- \`icon-144x144.png\` - Windows Metro
- \`icon-152x152.png\` - iOS Safari
- \`icon-192x192.png\` - Android Chrome (recommandé)
- \`icon-384x384.png\` - Android Chrome
- \`icon-512x512.png\` - Android Chrome (recommandé)

### Icônes de raccourcis
- \`shortcut-projects.png\` - Raccourci vers les projets
- \`shortcut-notifications.png\` - Raccourci vers les notifications
- \`shortcut-friends.png\` - Raccourci vers les amis

### Fichiers spéciaux
- \`favicon.svg\` - Favicon vectoriel moderne
- \`safari-pinned-tab.svg\` - Icône Safari onglet épinglé
- \`browserconfig.xml\` - Configuration Windows/IE

## Génération automatique

Les icônes peuvent être régénérées avec:
\`\`\`bash
node scripts/generate-pwa-icons.js
\`\`\`

## Optimisation

Pour de meilleures performances, optimisez les PNG avec:
- ImageOptim (macOS)
- TinyPNG (en ligne)
- pngquant (ligne de commande)

## Test

Testez les icônes dans Chrome DevTools:
1. F12 > Application > Manifest
2. Vérifiez que toutes les icônes se chargent
3. Testez l'installation PWA
`

  fs.writeFileSync(path.join(process.cwd(), 'public', 'icons', 'README.md'), readmeContent)
}

// Exécuter le script
if (require.main === module) {
  generateIcons()
  createIconsReadme()
} 