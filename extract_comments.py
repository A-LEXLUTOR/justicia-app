#!/usr/bin/env python3.11
# -*- coding: utf-8 -*-
"""
Script pour extraire les commentaires de révision des documents DOCX
"""

import os
import json
import zipfile
import xml.etree.ElementTree as ET
from docx import Document

def extract_comments_from_docx(docx_path):
    """Extraire les commentaires d'un document DOCX"""
    comments = []
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Vérifier si comments.xml existe
            if 'word/comments.xml' not in zip_ref.namelist():
                return comments
            
            # Lire le fichier comments.xml
            comments_xml = zip_ref.read('word/comments.xml')
            root = ET.fromstring(comments_xml)
            
            # Namespace pour Word
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Extraire tous les commentaires
            for comment in root.findall('.//w:comment', ns):
                comment_id = comment.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
                author = comment.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}author', '')
                
                # Extraire le texte du commentaire
                text_elements = comment.findall('.//w:t', ns)
                comment_text = ''.join([t.text for t in text_elements if t.text])
                
                if comment_text.strip():
                    comments.append({
                        'id': comment_id,
                        'author': author,
                        'text': comment_text.strip()
                    })
    
    except Exception as e:
        print(f"  ❌ Erreur lors de l'extraction des commentaires: {e}")
    
    return comments


def extract_text_with_comment_markers(docx_path):
    """Extraire le texte avec les marqueurs de commentaires"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Lire le document.xml
            doc_xml = zip_ref.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            # Namespace pour Word
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Extraire le texte avec les IDs de commentaires
            text_parts = []
            comment_ranges = {}
            
            # Parcourir tous les éléments
            for elem in root.iter():
                # Début de commentaire
                if elem.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}commentRangeStart':
                    comment_id = elem.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
                    comment_ranges[comment_id] = {'start': len(text_parts), 'text': ''}
                
                # Texte
                elif elem.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t':
                    if elem.text:
                        text_parts.append(elem.text)
                        # Ajouter le texte aux commentaires actifs
                        for comment_id, info in comment_ranges.items():
                            if 'end' not in info:
                                info['text'] += elem.text
                
                # Fin de commentaire
                elif elem.tag == '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}commentRangeEnd':
                    comment_id = elem.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
                    if comment_id in comment_ranges:
                        comment_ranges[comment_id]['end'] = len(text_parts)
            
            return ''.join(text_parts), comment_ranges
    
    except Exception as e:
        print(f"  ❌ Erreur lors de l'extraction du texte: {e}")
        return '', {}


def main():
    upload_dir = '/home/ubuntu/upload'
    output_file = '/home/ubuntu/data/documents_with_comments.json'
    
    # Liste tous les fichiers DOCX
    docx_files = [f for f in os.listdir(upload_dir) if f.endswith('.docx')]
    
    print(f"📄 Extraction des commentaires de {len(docx_files)} documents...\n")
    
    results = []
    
    for filename in sorted(docx_files):
        filepath = os.path.join(upload_dir, filename)
        print(f"Traitement: {filename}")
        
        # Extraire les commentaires
        comments = extract_comments_from_docx(filepath)
        
        # Extraire le texte avec les marqueurs
        text, comment_ranges = extract_text_with_comment_markers(filepath)
        
        if comments:
            print(f"  ✅ {len(comments)} commentaire(s) trouvé(s)")
            
            # Associer les commentaires aux zones de texte
            for comment in comments:
                comment_id = comment['id']
                if comment_id in comment_ranges:
                    comment['associated_text'] = comment_ranges[comment_id].get('text', '')
                else:
                    comment['associated_text'] = ''
            
            results.append({
                'filename': filename,
                'has_comments': True,
                'comment_count': len(comments),
                'comments': comments
            })
        else:
            print(f"  ℹ️  Aucun commentaire")
            results.append({
                'filename': filename,
                'has_comments': False,
                'comment_count': 0,
                'comments': []
            })
    
    # Sauvegarder les résultats
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Résultats sauvegardés dans: {output_file}")
    
    # Statistiques
    docs_with_comments = sum(1 for r in results if r['has_comments'])
    total_comments = sum(r['comment_count'] for r in results)
    
    print(f"\n📊 Statistiques:")
    print(f"  - Documents avec commentaires: {docs_with_comments}/{len(results)}")
    print(f"  - Total de commentaires: {total_comments}")


if __name__ == '__main__':
    main()
