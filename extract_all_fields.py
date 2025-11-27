#!/usr/bin/env python3.11
"""
Script pour extraire TOUS les champs [-] d'un document avec leur contexte
"""

from docx import Document
import re
import json
import sys

def extract_all_fields_with_context(docx_path):
    """
    Extrait tous les [-] avec le contexte (5 mots avant et après)
    """
    doc = Document(docx_path)
    
    # Extraire tout le texte
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    
    text = '\n'.join(full_text)
    
    # Trouver tous les [-] avec contexte
    fields = []
    words = text.split()
    
    for i, word in enumerate(words):
        if '[-]' in word:
            # Contexte avant (5 mots)
            context_before = ' '.join(words[max(0, i-5):i])
            # Contexte après (5 mots)
            context_after = ' '.join(words[i+1:min(len(words), i+6)])
            
            # Label basé sur le contexte
            label = context_before.strip()
            if not label:
                label = context_after.strip()
            
            # Nettoyer le label
            label = re.sub(r'[^\w\s\-àâäéèêëïîôùûüÿæœç]', '', label)
            label = label.strip()[:100]  # Limiter à 100 caractères
            
            if not label:
                label = f"Champ {len(fields) + 1}"
            
            fields.append({
                'index': len(fields),
                'label': label,
                'context_before': context_before,
                'context_after': context_after,
                'help': f"{context_before} [-] {context_after}"
            })
    
    return fields

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python extract_all_fields.py <docx_file>")
        sys.exit(1)
    
    docx_file = sys.argv[1]
    fields = extract_all_fields_with_context(docx_file)
    
    print(json.dumps(fields, ensure_ascii=False, indent=2))
