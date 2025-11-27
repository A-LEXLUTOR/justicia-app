import json
import re
from pathlib import Path

# Informations PORTEO BTP à pré-remplir
PORTEO_INFO = {
    "nom_societe": "PORTEO BTP",
    "forme_juridique": "Société anonyme",
    "capital_social": "3 000 000 000 FCFA",
    "siege_social": "Abidjan Plateau, Immeuble Teylium",
    "telephone": "+225 27 21 54 03 03",
    "rccm": "CI-ABJ-2011-B-9383",
    "representant": "Monsieur Hassan DAKHLALLAH",
    "qualite_representant": "Président Directeur Général"
}

def identify_fields(content):
    """Identifier les champs variables dans le contenu"""
    fields = []
    
    # Rechercher les tirets [-]
    tirets = re.findall(r'\[-+\]', content)
    for tiret in set(tirets):
        fields.append({
            "type": "tiret",
            "pattern": tiret,
            "label": "Champ à remplir",
            "required": True
        })
    
    # Rechercher les patterns courants
    patterns = [
        (r'\[.*?\]', "bracket", "Champ entre crochets"),
        (r'_{3,}', "underscore", "Ligne de saisie"),
        (r'\.{3,}', "dots", "Points de suspension"),
    ]
    
    for pattern, ptype, label in patterns:
        matches = re.findall(pattern, content)
        for match in set(matches):
            if match not in [f["pattern"] for f in fields]:
                fields.append({
                    "type": ptype,
                    "pattern": match,
                    "label": label,
                    "required": False
                })
    
    return fields

def prefill_porteo_info(content):
    """Pré-remplir les informations PORTEO BTP dans le contenu"""
    # Remplacements à effectuer
    replacements = {
        r'\[Nom de la société\]': PORTEO_INFO["nom_societe"],
        r'\[Société\]': PORTEO_INFO["nom_societe"],
        r'\[Forme juridique\]': PORTEO_INFO["forme_juridique"],
        r'\[Capital social\]': PORTEO_INFO["capital_social"],
        r'\[Siège social\]': PORTEO_INFO["siege_social"],
        r'\[Téléphone\]': PORTEO_INFO["telephone"],
        r'\[RCCM\]': PORTEO_INFO["rccm"],
        r'\[Représentant\]': PORTEO_INFO["representant"],
        r'\[Qualité\]': PORTEO_INFO["qualite_representant"],
    }
    
    prefilled_content = content
    for pattern, value in replacements.items():
        prefilled_content = re.sub(pattern, value, prefilled_content, flags=re.IGNORECASE)
    
    return prefilled_content

def main():
    # Charger les modèles extraits
    input_file = "/home/ubuntu/data/templates_content.json"
    with open(input_file, "r", encoding="utf-8") as f:
        templates = json.load(f)
    
    print(f"Pré-remplissage de {len(templates)} modèles avec les informations PORTEO BTP...")
    
    for i, template in enumerate(templates, 1):
        print(f"[{i}/{len(templates)}] {template['name']}")
        
        # Pré-remplir les informations PORTEO
        template["content_original"] = template["content"]
        template["content_prefilled"] = prefill_porteo_info(template["content"])
        
        # Identifier les champs variables
        template["fields"] = identify_fields(template["content_prefilled"])
        
        # Ajouter les informations PORTEO
        template["porteo_info"] = PORTEO_INFO
    
    # Sauvegarder les modèles pré-remplis
    output_file = "/home/ubuntu/data/templates_prefilled.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(templates, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Pré-remplissage terminé ! {len(templates)} modèles sauvegardés dans {output_file}")
    
    # Statistiques
    total_fields = sum(len(t["fields"]) for t in templates)
    print(f"📊 Total de champs variables identifiés : {total_fields}")

if __name__ == "__main__":
    main()
