#!/usr/bin/env python3.11
"""
Régénère templates_prefilled.json avec les IDs corrects de TemplateGallery.tsx
"""

import json
import os
from pathlib import Path
from extract_all_fields import extract_all_fields_with_context
from docx import Document

# Mapping des noms de fichiers vers les IDs de TemplateGallery.tsx
TEMPLATE_ID_MAPPING = {
    "COURRIERTYPEDEVALIDATIONDEPLANS.docx": "validation-plans",
    "PORTEOBTPCI-MODELETYPEMISEENDEMEUREAVANCEMENTDESTRAVAUX-NOUVELLEMOUTUREDECONTRATS.docx": "mise-en-demeure-avancement",
    "PORTEOBTPCI-MISEENDEMEUREQUALITEDESTRAVAUX-NOUVELLEMOUTUREDECONTRATS.docx": "mise-en-demeure-qualite",
    "PORTEOBTPCI-MISEENDEMEUREHSE-NOUVELLEMOUTUREDECONTRATS.docx": "mise-en-demeure-hse",
    "MODELETYPERETARDDESENTREPRISECHARGEESDESDEVOIEMENTSDERESEAUX.docx": "retard-devoiement-reseaux",
    "COURRIERTYPE-RELANCEDEMANDED'INFORMATIONCOMPLEMENTAIRES.docx": "relance-infos-complementaires",
    "PORTOBTP-MODELETYPEDEDEMANDEDERECEPTIONPROVISOIREDESTRAVAUX.docx": "reception-provisoire",
    "COURRIERTYPE-DEMANDED'INFORMATIONCOMPLEMENTAIRES.docx": "demande-infos-complementaires",
    "PORTEOBTP-MODELETYPERECEPTIONPARTIELLEPROVISOIRE.docx": "reception-partielle",
    "PORTEOBTP-MODELETYPEDEMANDEDERECEPTIONDEFINITIVEDESTRAVAUX.docx": "reception-definitive",
    "PORTEOBTP-MODELETYPEDEDEMANDEDEPAIEMENTDELARETENUEDEGARANTIE-MAINLEVEESURLACAUTION.docx": "paiement-retenue-garantie",
    "MODELETYPEDEMANDEDEPROLONGATIONDEDELAIS.docx": "prolongation-delais",
    "PORTEOBTP-MODELETYPEDEDEMANDEDELEVEEDECAUTIONNEMENTDEFINITIF.docx": "levee-cautionnement",
    "PORTEOBTP-COURRIERTYPE-DEPLACEMENTDERESEAU-REPARATIONDESDOMMAGES.docx": "deplacement-reseau-dommages",
    "MODELETYPEDECOURRIER-LIBERATIONDEL'EMPRISEDESTRAVAUX.docx": "liberation-emprise",
    "MODELETYPEDECOURRIER-FORMALISATIOND'UNEINSTRUCTIONVERBALE.docx": "formalisation-instruction",
    "CONTRATTYPEDETRANSPORTMATERIAUXOUDEFOURNITURES.docx": "contrat-transport",
    "MODELETYPEPROTOCOLETRANSACTIONNELCARRIERE.docx": "protocole-transactionnel-carriere",
    "CONTRATDELOCATIONDETERRAINPOURSTOCKAGEDEMATERIAUX.docx": "location-terrain-stockage",
    "MODELETYPECOURRIER-ATTEINTEDELAMASSEINITIALEDESTRAVAUX.docx": "atteinte-masse-initiale",
    "EMPRUNTDEMATERIAUXENZONERURALE.docx": "emprunt-materiaux-rural",
    "MODELETYPEDECONTRATDEMISEENDEPOTDEFINITIFDEMATERIAUX.docx": "depot-definitif-materiaux",
    "PORTEOBTPCI-MODELETYPE-MISEADISPOSITIONDETERRAINNUPARUNEADMINISTRATION.docx": "mise-disposition-terrain-admin",
    "PORTEOBTPCI-MODELETYPE-MISEADISPOSITIONDETERRAINNUPARUNVILLAGE.docx": "mise-disposition-terrain-village",
    "PORTEOBTPCI-MODELETYPE-MISEADISPOSITIONDETERRAINNUPARUNPARTICULIER.docx": "mise-disposition-terrain-particulier",
    "CONVENTIONPOURLESSOINSMEDICAUX-MODELE.docx": "convention-soins-medicaux",
    "CONTRATDELOCATIOND'ENGINS.docx": "location-engins",
    "PORTEOBTPCI-MODELETYPECONTRATDEFOURNITUREDEMATERIAUX.docx": "fourniture-materiaux",
    "CONDITIONSGENERALESD'ACHAT.docx": "conditions-generales-achat",
    "CONDITIONSGENERALESDEVENTE.docx": "conditions-generales-vente",
    "5PLANNING00(2).docx": "journal-chantier",  # Planning = Journal de chantier
}

def extract_text(docx_path):
    """Extrait le texte complet d'un document"""
    doc = Document(docx_path)
    return '\n'.join([para.text for para in doc.paragraphs])

def main():
    upload_dir = Path('/home/ubuntu/upload')
    docx_files = list(upload_dir.glob('*.docx')) + list(upload_dir.glob('*.doc'))
    
    templates = []
    processed_ids = set()
    
    print(f"Traitement de {len(docx_files)} documents...")
    
    for docx_file in docx_files:
        try:
            filename = docx_file.name
            
            # Chercher l'ID dans le mapping
            template_id = TEMPLATE_ID_MAPPING.get(filename)
            
            if not template_id:
                print(f"  ⚠️  Pas de mapping pour {filename}, ignoré")
                continue
            
            if template_id in processed_ids:
                print(f"  ⚠️  ID {template_id} déjà traité, ignoré")
                continue
            
            print(f"  ✅ {filename} → {template_id}")
            
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
            processed_ids.add(template_id)
            
        except Exception as e:
            print(f"  ⚠️  Erreur pour {filename}: {e}")
            continue
    
    # Sauvegarder le fichier JSON
    output_file = '/home/ubuntu/public/data/templates_prefilled.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(templates, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ {len(templates)} modèles générés → {output_file}")
    print(f"\nIDs générés: {sorted(processed_ids)}")

if __name__ == '__main__':
    main()
