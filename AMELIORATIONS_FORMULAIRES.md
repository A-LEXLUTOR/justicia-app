# Améliorations du Système de Génération de Documents

## 🎯 Problèmes identifiés

### 1. **Formulaire incomplet**
- Seulement 4 champs détectés au lieu de tous les champs `[-]`
- Beaucoup de trous non remplis dans le document final
- Répétition de la même valeur ("charbon") dans tous les champs

### 2. **Pas de zone pour modifications IA**
- Impossible de demander des modifications personnalisées
- Pas de flexibilité pour adapter le document

---

## ✅ Solutions implémentées

### 1️⃣ **Extraction complète des champs**

**Script créé** : `/home/ubuntu/extract_all_fields.py`

Ce script extrait **TOUS** les champs `[-]` avec leur contexte :
- 5 mots avant le `[-]`
- 5 mots après le `[-]`
- Label intelligent basé sur le contexte
- Texte d'aide pour chaque champ

**Exemple** :
```json
{
  "index": 0,
  "label": "Nom de l'entreprise transporteur",
  "context_before": "D'une part, ET :",
  "context_after": "Ayant son siège à",
  "help": "D'une part, ET : [-] Ayant son siège à"
}
```

### 2️⃣ **Zone Instructions IA**

**Modification** : `/home/ubuntu/components/TemplateFormGenerator.tsx`

Ajout d'une zone de texte permettant de :
- Modifier des paragraphes spécifiques
- Ajouter des clauses supplémentaires
- Adapter le ton ou le style
- Corriger des formulations

**Interface** :
- Titre : "🤖 Instructions IA (optionnel)"
- Description : "Demandez à l'IA de modifier, ajouter ou adapter des sections du document."
- Textarea de 4 lignes
- Exemple : "Modifie l'article 12 pour ajouter une clause de révision des prix tous les 6 mois"

### 3️⃣ **Script de régénération complet**

**Script créé** : `/home/ubuntu/regenerate_templates_full.py`

Ce script :
- Traite tous les documents DOCX dans `/home/ubuntu/upload`
- Extrait TOUS les champs `[-]` avec contexte
- Génère un fichier `templates_prefilled.json` complet
- Conserve les informations PORTEO BTP pré-remplies

---

## 📋 Prochaines étapes pour finaliser

### Étape 1 : Régénérer le fichier JSON

```bash
cd /home/ubuntu
python3.11 regenerate_templates_full.py
```

Cela va créer `/home/ubuntu/data/templates_prefilled.json` avec TOUS les champs.

### Étape 2 : Copier dans le dossier public

```bash
cp /home/ubuntu/data/templates_prefilled.json /home/ubuntu/public/data/
```

### Étape 3 : Corriger la logique de remplacement

Actuellement, le code remplace **tous** les `[-]` par la même valeur. Il faut modifier `TemplateFormGenerator.tsx` (lignes 94-101) pour remplacer **séquentiellement** :

```typescript
// AVANT (remplace tous les [-] par la même valeur)
template.fields.forEach((field, index) => {
    const fieldKey = `field_${index}`;
    const value = fieldValues[fieldKey] || field.pattern;
    generatedContent = generatedContent.replace(
        new RegExp(field.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        value
    );
});

// APRÈS (remplace séquentiellement)
template.fields.forEach((field, index) => {
    const fieldKey = `field_${index}`;
    const value = fieldValues[fieldKey] || field.pattern;
    // Remplacer seulement la PREMIÈRE occurrence
    generatedContent = generatedContent.replace(field.pattern, value);
});
```

### Étape 4 : Redémarrer Vite

```bash
# Arrêter Vite (Ctrl+C dans le terminal)
# Redémarrer
npm run dev
```

### Étape 5 : Tester avec le contrat de transport

1. Ouvrir Justicia
2. + → Créer un document → Depuis un Modèle
3. Sélectionner "Contrat de Transport"
4. Remplir TOUS les champs (il devrait y en avoir beaucoup plus maintenant)
5. Ajouter des instructions IA si nécessaire
6. Générer le Document
7. Cliquer sur "Word" pour télécharger

---

## 🎊 Résultat attendu

### Avant
- ❌ 4 champs seulement
- ❌ Beaucoup de `[-]` non remplis
- ❌ Répétition de "charbon" partout
- ❌ Pas de possibilité de modifications

### Après
- ✅ Tous les champs `[-]` détectés (30+)
- ✅ Chaque champ avec son contexte
- ✅ Labels intelligents et descriptifs
- ✅ Zone Instructions IA pour modifications
- ✅ Remplacement séquentiel correct
- ✅ Document complet et professionnel

---

## 📝 Exemple de formulaire amélioré

**Contrat de Transport** :
- Nom de l'entreprise transporteur *
- Siège social du transporteur *
- Numéro RCCM du transporteur *
- Téléphone du transporteur *
- Représentant du transporteur *
- Type de produits à transporter *
- Lieu de départ *
- Lieu d'arrivée *
- Durée du contrat *
- Date de début *
- Date de fin *
- Prix de la tonne kilométrique *
- Quantités à transporter *
- Montant total du contrat *
- Avance de démarrage (OUI/NON) *
- Pourcentage AVD *
- Montant AVD *
- Cautionnement AVD (OUI/NON) *
- Délai de paiement *
- Montant de couverture assurance *
- Date de signature *
- Nombre d'exemplaires *
- ... (et tous les autres champs)

**Zone Instructions IA** :
```
Modifie l'article 12 pour ajouter une clause de révision des prix tous les 6 mois.
Ajoute un article sur la protection des données personnelles.
Adapte le ton pour être plus formel.
```

---

## 🚀 Déploiement

Une fois les étapes ci-dessus complétées, le système sera prêt pour la production avec :
- ✅ Formulaires complets
- ✅ Zone Instructions IA
- ✅ Remplacement correct des champs
- ✅ Export Word avec papier à en-tête PORTEO
- ✅ Voix OpenAI TTS
- ✅ Téléchargement multiple de documents

**Le système Justicia sera alors complet et opérationnel !** 🎉
