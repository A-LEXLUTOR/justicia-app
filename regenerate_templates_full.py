#!/usr/bin/env python3.11
"""
Régénère templates_prefilled.json avec TOUS les champs [-] détectés
"""

import json
import os
import sys
from pathlib import Path
from extract_all_fields import extract_all_fields_with_context
from docx import Document

# Mapping des noms de fichiers vers les IDs de modèles
TEMPLATE_IDS = {
    "CONDITIONSGENERALESD'ACHAT.docx": "conditions-generales-achat",
    "CONDITIONSGENERALESDEVENTE.docx": "conditions-generales-vente",
    "CONTRATTYPEDETRANSPORTMATERIAUXOUDEFOURNITURES.docx": "contrat-transport",
    "COURRIERTYPEDEVALIDATIONDEPLANS.docx": "validation-plans",
    # Ajoutez les autres mappings ici...
}

def get_template_id(filename):
    """Convertit un nom de fichier en ID de modèle"""
    # Essayer le mapping d'abord
    if filename in TEMPLATE_IDS:
        return TEMPLATE_IDS[filename]
    
    # Sinon, créer un ID à partir du nom de fichier
    name = filename.replace('.docx', '').replace('.doc', '')
    name = name.lower()
    name = name.replace("'", '-')
    name = name.replace(' ', '-')
    return name

def extract_text(docx_path):
    """Extrait le texte complet d'un document"""
    doc = Document(docx_path)
    return '\n'.join([para.text for para in doc.paragraphs])

def main():
    upload_dir = Path('/home/ubuntu/upload')
    docx_files = list(upload_dir.glob('*.docx')) + list(upload_dir.glob('*.doc'))
    
    templates = []
    
    print(f"Traitement de {len(docx_files)} documents...")
    
    for docx_file in docx_files:
        try:
            filename = docx_file.name
            template_id = get_template_id(filename)
            
            print(f"  - {filename} → {template_id}")
            
            # Extraire TOUS les champs
            fields = extract_all_fields_with_context(str(docx_file))
            
            # Extraire le texte complet
            content = extract_text(str(docx_file))
            
            # Créer la structure du template
            template = {
                "id": template_id,
                "name": filename.replace('.docx', '').replace('.doc', ''),
                "filename": filename,
                "type": "legal",
                "content_prefilled": content,
                "fields": [
                    {
                        "type": "text",
                        "pattern": "[-]",
                        "label": field['label'],
                        "help": field['help'],
                        "required": True
                    }
                    for field in fields
                ],
                "porteo_info": {
                    "nom_societe": "PORTEO BTP",
                    "forme_juridique": "SA",
                    "capital_social": "3 000 000 000 FCFA",
                    "siege_social": "Abidjan Plateau, Immeuble Teylium",
                    "telephone": "+225 27 21 54 03 03",
                    "rccm": "CI-ABJ-2011-B-9383",
                    "representant": "Hassan DAKHLALLAH",
                    "qualite_representant": "Président Directeur Général"
                }
            }
            
            templates.append(template)
            
        except Exception as e:
            print(f"  ⚠️  Erreur pour {filename}: {e}")
            continue
    
    # Sauvegarder le fichier JSON
    output_file = '/home/ubuntu/data/templates_prefilled.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(templates, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ {len(templates)} modèles générés → {output_file}")

if __name__ == '__main__':
    main()
