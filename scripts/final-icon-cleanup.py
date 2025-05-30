#!/usr/bin/env python3

import os
import re

print("🧹 Nettoyage final des icônes complexes...\n")

# Icône complexe à remplacer (version complète)
old_icon = "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"

# Nouvelle icône simple
new_icon = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"

# Fichiers à traiter
files_to_process = [
    "src/app/not-found.js",
    "src/app/friends/page.js", 
    "src/app/todos/[projectId]/page.js",
    "src/components/Navbar.js",
    "src/components/ProjectCollaborationModal.js"
]

total_replacements = 0

for file_path in files_to_process:
    if not os.path.exists(file_path):
        print(f"⚠️  Fichier non trouvé: {file_path}")
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Compter les occurrences avant remplacement
        count_before = content.count(old_icon)
        
        if count_before > 0:
            # Remplacer toutes les occurrences
            new_content = content.replace(old_icon, new_icon)
            
            # Écrire le fichier modifié
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {file_path}: {count_before} icône(s) corrigée(s)")
            total_replacements += count_before
        else:
            print(f"✓ {file_path}: Déjà à jour")
            
    except Exception as e:
        print(f"❌ Erreur lors du traitement de {file_path}: {e}")

print(f"\n📊 Résumé final:")
print(f"   Icônes corrigées: {total_replacements}")

if total_replacements > 0:
    print("\n🎉 Nettoyage terminé ! Toutes les icônes utilisent maintenant la version simple et équilibrée.")
else:
    print("\n✅ Toutes les icônes étaient déjà à jour !") 