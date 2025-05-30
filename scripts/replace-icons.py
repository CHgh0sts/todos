#!/usr/bin/env python3

import os
import re
import glob

print("🔄 Remplacement des icônes complexes de collaboration...\n")

# Icônes à remplacer
old_icon_1 = "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
old_icon_2 = "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 515 0z"
new_icon = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"

# Trouver tous les fichiers JavaScript
js_files = glob.glob("src/**/*.js", recursive=True)

total_files = 0
modified_files = 0
total_replacements = 0

for file_path in js_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        file_replacements = 0
        
        # Remplacer les deux versions d'icônes
        if old_icon_1 in content:
            count = content.count(old_icon_1)
            content = content.replace(old_icon_1, new_icon)
            file_replacements += count
            print(f"  ✓ Icône complexe v1: {count} remplacement(s) dans {file_path}")
        
        if old_icon_2 in content:
            count = content.count(old_icon_2)
            content = content.replace(old_icon_2, new_icon)
            file_replacements += count
            print(f"  ✓ Icône complexe v2: {count} remplacement(s) dans {file_path}")
        
        # Écrire le fichier modifié
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            modified_files += 1
            total_replacements += file_replacements
            print(f"📝 {file_path}: {file_replacements} remplacement(s) appliqué(s)")
        
        total_files += 1
        
    except Exception as e:
        print(f"❌ Erreur lors du traitement de {file_path}: {e}")

print(f"\n📊 Résumé:")
print(f"   Fichiers traités: {total_files}")
print(f"   Fichiers modifiés: {modified_files}")
print(f"   Remplacements totaux: {total_replacements}")

if total_replacements > 0:
    print("\n✅ Remplacement des icônes complexes terminé!")
    print("🎯 Toutes les icônes de collaboration utilisent maintenant la version simple et équilibrée")
else:
    print("\n✅ Aucun remplacement nécessaire - toutes les icônes sont déjà à jour!") 