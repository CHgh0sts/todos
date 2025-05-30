#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔄 Remplacement des icônes complexes de collaboration...\n')

// Icônes à remplacer
const iconReplacements = [
  {
    old: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    new: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    description: 'Icône complexe de collaboration (version 1)'
  },
  {
    old: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 515 0z',
    new: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    description: 'Icône complexe de collaboration (version 2)'
  }
]

// Fichiers à traiter
const filesToProcess = [
  'src/app/page.js',
  'src/app/admin/projects/page.js',
  'src/app/not-found.js',
  'src/app/friends/page.js',
  'src/app/todos/[projectId]/page.js',
  'src/components/Navbar.js',
  'src/components/ProjectCollaborationModal.js'
]

let totalFiles = 0
let modifiedFiles = 0
let totalChanges = 0

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`)
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    let fileChanges = 0
    
    iconReplacements.forEach(replacement => {
      const oldIcon = replacement.old
      const newIcon = replacement.new
      
      if (newContent.includes(oldIcon)) {
        newContent = newContent.replace(new RegExp(oldIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newIcon)
        const matches = (content.match(new RegExp(oldIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
        fileChanges += matches
        console.log(`  ✓ ${replacement.description}: ${matches} remplacement(s)`)
      }
    })
    
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`📝 ${filePath}: ${fileChanges} remplacement(s) appliqué(s)`)
      modifiedFiles++
      totalChanges += fileChanges
    }
    
    totalFiles++
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message)
  }
}

// Traitement des fichiers
filesToProcess.forEach(processFile)

console.log('\n📊 Résumé:')
console.log(`   Fichiers traités: ${totalFiles}`)
console.log(`   Fichiers modifiés: ${modifiedFiles}`)
console.log(`   Remplacements totaux: ${totalChanges}`)

if (totalChanges > 0) {
  console.log('\n✅ Remplacement des icônes complexes terminé!')
  console.log('🎯 Toutes les icônes de collaboration utilisent maintenant la version simple et équilibrée')
} else {
  console.log('\n✅ Aucun remplacement nécessaire - toutes les icônes sont déjà à jour!')
} 