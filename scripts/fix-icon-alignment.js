#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

console.log('🔧 Correction automatique de l\'alignement des icônes...\n')

// Patterns à corriger
const patterns = [
  // SVG avec mr-1, mr-2, mr-3 sans flex-shrink-0
  {
    search: /(<svg[^>]*className="[^"]*)(w-\d+ h-\d+[^"]*mr-\d+)([^"]*"[^>]*>)/g,
    replace: (match, before, classes, after) => {
      if (!classes.includes('flex-shrink-0')) {
        return `${before}${classes} flex-shrink-0${after}`
      }
      return match
    },
    description: 'Ajout de flex-shrink-0 aux SVG avec marge droite'
  },
  
  // SVG avec ml-1, ml-2, ml-3 sans flex-shrink-0
  {
    search: /(<svg[^>]*className="[^"]*)(w-\d+ h-\d+[^"]*ml-\d+)([^"]*"[^>]*>)/g,
    replace: (match, before, classes, after) => {
      if (!classes.includes('flex-shrink-0')) {
        return `${before}${classes} flex-shrink-0${after}`
      }
      return match
    },
    description: 'Ajout de flex-shrink-0 aux SVG avec marge gauche'
  },

  // Div avec icônes sans flex-shrink-0
  {
    search: /(<div[^>]*className="[^"]*)(w-\d+ h-\d+[^"]*(?:mr-\d+|ml-\d+)[^"]*bg-[^"]*rounded[^"]*flex[^"]*items-center[^"]*justify-center)([^"]*"[^>]*>)/g,
    replace: (match, before, classes, after) => {
      if (!classes.includes('flex-shrink-0')) {
        return `${before}${classes} flex-shrink-0${after}`
      }
      return match
    },
    description: 'Ajout de flex-shrink-0 aux conteneurs d\'icônes'
  },

  // Remplacement de l'ancienne icône complexe de collaboration (version 1)
  {
    search: /M17 20h5v-2a3 3 0 00-5\.356-1\.857M17 20H7m10 0v-2c0-\.656-\.126-1\.283-\.356-1\.857M7 20H2v-2a3 3 0 515\.356-1\.857M7 20v-2c0-\.656\.126-1\.283\.356-1\.857m0 0a5\.002 5\.002 0 919\.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z/g,
    replace: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    description: 'Remplacement de l\'ancienne icône complexe de collaboration (version 1)'
  },

  // Remplacement de l'ancienne icône complexe de collaboration (version 2)
  {
    search: /M12 4\.354a4 4 0 110 5\.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5\.197m13\.5-9a2\.5 2\.5 0 11-5 0 2\.5 2\.5 0 515 0z/g,
    replace: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    description: 'Remplacement de l\'ancienne icône complexe de collaboration (version 2)'
  }
]

// Fichiers à traiter
const filePatterns = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx'
]

let totalFiles = 0
let modifiedFiles = 0
let totalChanges = 0

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    let fileChanges = 0
    
    patterns.forEach(pattern => {
      if (typeof pattern.search === 'string') {
        // Pour les remplacements de chaînes simples
        const regex = new RegExp(pattern.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        const matches = content.match(regex)
        if (matches && matches.length > 0) {
          newContent = newContent.replace(regex, pattern.replace)
          fileChanges += matches.length
          console.log(`  ✓ ${pattern.description}: ${matches.length} correction(s)`)
        }
      } else {
        // Pour les regex complexes
        const matches = [...content.matchAll(pattern.search)]
        if (matches.length > 0) {
          newContent = newContent.replace(pattern.search, pattern.replace)
          fileChanges += matches.length
          console.log(`  ✓ ${pattern.description}: ${matches.length} correction(s)`)
        }
      }
    })
    
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`📝 ${filePath}: ${fileChanges} correction(s) appliquée(s)`)
      modifiedFiles++
      totalChanges += fileChanges
    }
    
    totalFiles++
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message)
  }
}

// Traitement des fichiers
filePatterns.forEach(pattern => {
  const files = glob.sync(pattern, { ignore: ['node_modules/**', '.next/**'] })
  files.forEach(processFile)
})

console.log('\n📊 Résumé:')
console.log(`   Fichiers traités: ${totalFiles}`)
console.log(`   Fichiers modifiés: ${modifiedFiles}`)
console.log(`   Corrections totales: ${totalChanges}`)

if (totalChanges > 0) {
  console.log('\n✅ Correction de l\'alignement des icônes terminée!')
  console.log('💡 Recommandations supplémentaires:')
  console.log('   - Vérifiez visuellement les pages modifiées')
  console.log('   - Testez sur différentes tailles d\'écran')
  console.log('   - Assurez-vous que les icônes restent alignées lors du redimensionnement')
} else {
  console.log('\n✅ Aucune correction nécessaire - tous les alignements sont déjà corrects!')
} 