#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
Script pour fusionner les champs [-] et les commentaires de révision
"""

import json
import re

def load_json(filepath):
    """Charger un fichier JSON"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filepath):
    """Sauvegarder un fichier JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def normalize_filename(filename):
    """Normaliser un nom de fichier pour la comparaison"""
    return filename.replace('.docx', '').replace('.DOCX', '').upper().replace(' ', '').replace("'", "")

def main():
    # Charger les données existantes
    templates_file = '/home/ubuntu/public/data/templates_prefilled.json'
    comments_file = '/home/ubuntu/data/documents_with_comments.json'
    output_file = '/home/ubuntu/public/data/templates_prefilled.json'
    
    print("📄 Chargement des données...\n")
    templates = load_json(templates_file)
    comments_data = load_json(comments_file)
    
    # Créer un dictionnaire des commentaires par nom de fichier
    comments_by_file = {}
    for doc in comments_data:
        normalized = normalize_filename(doc['filename'])
        comments_by_file[normalized] = doc['comments']
    
    print(f"✅ {len(templates)} modèles chargés")
    print(f"✅ {len(comments_by_file)} documents avec commentaires\n")
    
    # Fusionner les commentaires avec les templates
    updated_count = 0
    
    for template in templates:
        filename = template.get('filename', '')
        normalized = normalize_filename(filename)
        
        # Récupérer les commentaires pour ce fichier
        comments = comments_by_file.get(normalized, [])
        
        if comments:
            print(f"📝 {template['name']}")
            print(f"   Fichier: {filename}")
            print(f"   {len(comments)} commentaire(s)")
            
            # Ajouter les commentaires aux champs existants
            existing_fields = template.get('fields', [])
            
            # Créer de nouveaux champs pour les commentaires
            comment_fields = []
            for i, comment in enumerate(comments):
                # Vérifier si le commentaire est lié à un [-]
                associated_text = comment.get('associated_text', '')
                
                if '[-]' in associated_text:
                    # C'est un champ [-] avec un commentaire d'instruction
                    field = {
                        'label': comment['text'],
                        'pattern': '[-]',
                        'required': True,
                        'type': 'text',
                        'help': f"Zone: {associated_text[:50]}..." if len(associated_text) > 50 else f"Zone: {associated_text}",
                        'comment_id': comment['id']
                    }
                    comment_fields.append(field)
                else:
                    # C'est un commentaire sur du texte existant (pas un champ à remplir)
                    # On l'ajoute comme note informative
                    field = {
                        'label': f"Note: {comment['text']}",
                        'pattern': associated_text,
                        'required': False,
                        'type': 'info',
                        'help': f"Commentaire sur: {associated_text[:50]}..." if len(associated_text) > 50 else f"Commentaire sur: {associated_text}",
                        'comment_id': comment['id']
                    }
                    # On n'ajoute pas les notes informatives comme champs
                    # comment_fields.append(field)
            
            # Fusionner avec les champs existants (en évitant les doublons)
            # Les champs existants sont basés sur les [-], les comment_fields aussi
            # On garde les comment_fields car ils ont des labels plus descriptifs
            
            if comment_fields:
                # Remplacer les champs génériques par les champs avec commentaires
                template['fields'] = comment_fields
                print(f"   ✅ {len(comment_fields)} champ(s) avec instructions ajouté(s)")
            else:
                print(f"   ℹ️  Commentaires informatifs uniquement (pas de champs à remplir)")
            
            # Ajouter les commentaires bruts pour référence
            template['comments'] = comments
            updated_count += 1
            print()
    
    # Sauvegarder les templates mis à jour
    save_json(templates, output_file)
    
    print(f"✅ {updated_count} modèles mis à jour avec des commentaires")
    print(f"✅ Fichier sauvegardé: {output_file}")

if __name__ == '__main__':
    main()
