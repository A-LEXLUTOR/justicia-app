# Améliorations des Prompts Système de Justicia

## 🎯 Objectif

Transformer Justicia en un assistant juridique de niveau expert, capable d'analyses approfondies et de réponses structurées de haute qualité, inspiré des meilleures pratiques de Manus.

---

## ✅ 1. Prompt de Chat Conversationnel Avancé

### Fichier Modifié
`/home/ubuntu/services/llama-api.services.ts` (lignes 383-570+)

### Améliorations Apportées

#### A. Structure Hiérarchisée

Le prompt est maintenant organisé en sections claires :

1. **Contexte Disponible** - Documents RAG fournis
2. **Votre Mission** - Objectif clair de l'IA
3. **Instructions de Réponse** - 7 sections détaillées
4. **Exemples** - Modèles de réponses parfaites
5. **Rappel Final** - Checklist de validation

#### B. Analyse de la Demande

L'IA doit maintenant identifier AVANT de répondre :
- **Type de demande** : Question factuelle, analyse, comparaison, synthèse, conseil
- **Documents pertinents** : Quels documents utiliser
- **Niveau de détail** : Réponse rapide ou approfondie

#### C. Citations Systématiques

Format imposé pour les sources :
```
(Source : [Nom du document], Article X, Section Y)
```

Exemple :
```
(Source : Code du Travail Ivoirien 2023, Article 25, Section II)
```

#### D. Structure de Réponse Obligatoire

**Pour questions simples :**
```markdown
## Réponse Directe
[Réponse claire]

### Source
[Citation avec référence]
```

**Pour analyses complexes :**
```markdown
## Synthèse
[Résumé 2-3 phrases]

## Analyse Détaillée
### [Sous-titre 1]
[Contenu avec citations]

## Sources
- [Références]

## Recommandations
[Conseils pratiques]
```

#### E. Formatage Markdown Strict

Instructions détaillées pour :
- **Titres** : `##` sections principales, `###` sous-sections
- **Paragraphes** : Courts (3-5 lignes), aérés
- **Listes** : Puces (`-`) ou numéros (`1.`)
- **Emphase** : `**gras**` pour termes clés, `*italique*` pour nuances
- **Citations** : `>` pour extraits d'articles
- **Tableaux** : Pour comparaisons

#### F. Qualité du Contenu

Trois piliers imposés :

1. **Précision**
   - Factuel (basé sur documents)
   - Exact (numéros d'articles vérifiés)
   - Complet (pas de zones d'ombre)

2. **Clarté**
   - Langage accessible
   - Phrases courtes (15-20 mots max)
   - Transitions fluides

3. **Utilité**
   - Actionable (conseils pratiques)
   - Contextualisé (implications concrètes)
   - Anticipé (questions implicites)

#### G. Ton et Style

- **Professionnel** : Vocabulaire juridique approprié
- **Pédagogique** : Expliquer, pas seulement énoncer
- **Respectueux** : Courtois et bienveillant
- **Confiant** : Affirmer quand étayé
- **Humble** : Admettre les limites

#### H. Exemples Intégrés

Le prompt contient 2 exemples complets de réponses parfaites :
- Exemple 1 : Question factuelle simple
- Exemple 2 : Analyse juridique complexe

---

## ✅ 2. Prompt d'Analyse de Documents Ultra-Détaillé

### Nouveau Fichier Créé
`/home/ubuntu/services/documentAnalysisPrompt.ts`

### Structure du Prompt (2500+ mots)

#### A. Structure JSON Attendue

Définition claire des 4 sections :
1. `plainLanguageSummary` - Analyse complète en markdown
2. `flags` - Points importants identifiés
3. `riskAssessment` - Évaluation multi-dimensionnelle
4. `aiInsights` - Analyse d'expert approfondie

#### B. plainLanguageSummary (MINIMUM 800 MOTS)

Template markdown obligatoire :

```markdown
## 📄 Nature du Document
**Type** : [...]
**Origine** : [...]
**Date** : [...]
**Référence** : [...]

### Contexte
[2-3 paragraphes]

---

## 🎯 Objet et Finalité
### Objectif Principal
[...]

### Champ d'Application
[...]

### Portée Juridique
[...]

---

## 📋 Contenu Détaillé
### Section 1 : [Titre]
[Résumé détaillé]

**Points importants :**
- [Point 1]
- [Point 2]

[Répéter pour TOUTES les sections]

---

## 🔑 Points Clés à Retenir
1. **[Titre]** : [Explication]
[5-10 points minimum]

---

## ⚖️ Implications Juridiques
### Pour les Particuliers
[...]

### Pour les Entreprises
[...]

### Pour les Professionnels du Droit
[...]

---

## 📊 Statistiques du Document
- Nombre de pages : [X]
- Nombre d'articles : [X]
[...]

---

## 🔗 Liens et Références
[Documents connexes]
```

#### C. flags (5-15 ÉLÉMENTS)

Types de flags à identifier :
- Clauses critiques
- Obligations
- Droits
- Délais
- Conditions
- Sanctions
- Exceptions
- Définitions

Format détaillé pour chaque flag :
```json
{
  "id": "flag_unique_id",
  "title": "Titre court (max 60 caractères)",
  "clause": "Citation EXACTE (apostrophes simples)",
  "explanation": "Explication détaillée (100-200 mots)",
  "severity": "Faible|Moyen|Élevé",
  "suggestedRewrite": "Reformulation OU commentaire"
}
```

Critères de sévérité définis :
- **Élevé** : Impact majeur, sanctions lourdes
- **Moyen** : Impact significatif
- **Faible** : Impact limité

#### D. riskAssessment (5-10 DIMENSIONS)

Dimensions selon le type de document :

**Pour un contrat :**
- Clarté des obligations
- Équilibre des parties
- Protection des droits
- Clauses de résiliation
- Résolution des litiges

**Pour une loi/règlement :**
- Clarté de la rédaction
- Applicabilité pratique
- Conformité constitutionnelle
- Impact sur les citoyens
- Mécanismes de contrôle

**Pour un rapport :**
- Qualité de l'analyse
- Fiabilité des sources
- Pertinence des recommandations
- Exhaustivité
- Objectivité

Format d'évaluation :
```json
{
  "area": "Nom de la dimension",
  "assessment": "Évaluation détaillée (150-250 mots)",
  "score": 7  // 0 = excellent, 10 = très problématique
}
```

#### E. aiInsights (MINIMUM 500 MOTS)

Template markdown obligatoire :

```markdown
## 🔍 Analyse Approfondie

### Forces du Document
[3-5 paragraphes]

### Faiblesses ou Zones d'Attention
[3-5 paragraphes]

### Comparaison avec les Standards
[...]

---

## 💡 Recommandations

### Pour les Utilisateurs
1. **[Recommandation 1]** : [Explication]
2. **[Recommandation 2]** : [Explication]
3. **[Recommandation 3]** : [Explication]

### Pour les Professionnels
[Conseils techniques]

---

## 🎯 Actions à Entreprendre
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

---

## 📚 Pour Aller Plus Loin
[Recherches complémentaires]

---

## ✅ Conclusion
[Synthèse finale en 2-3 paragraphes]
```

#### F. Règles JSON Strictes

8 règles détaillées pour éviter les erreurs :
1. Guillemets doubles uniquement pour clés/valeurs
2. Apostrophes simples dans les valeurs
3. `\n` pour retours à la ligne
4. Éviter caractères Unicode problématiques
5. Vérifier accolades/crochets
6. Pas de virgule après dernier élément
7. Nombres sans guillemets
8. Sévérité exacte : "Faible", "Moyen", "Élevé"

#### G. Exemple Complet

Un exemple JSON complet de 100+ lignes est fourni pour guider l'IA.

---

## 📊 Comparaison Avant/Après

| Aspect | Avant | Après | Amélioration |
|--------|-------|-------|--------------|
| **Longueur prompt chat** | ~300 mots | ~1500 mots | +400% |
| **Longueur prompt analyse** | ~200 mots | ~2500 mots | +1150% |
| **Structure** | Basique | Hiérarchisée | ✅ |
| **Exemples** | Aucun | 3 complets | ✅ |
| **Instructions formatage** | Vagues | Strictes | ✅ |
| **Citations sources** | Suggérées | Obligatoires | ✅ |
| **Analyse minimum** | Non spécifié | 800 mots | ✅ |
| **Flags minimum** | Non spécifié | 5-15 | ✅ |
| **Dimensions évaluation** | Non spécifié | 5-10 | ✅ |

---

## 🎯 Résultats Attendus

### Pour le Chat

**Avant :**
> "Le contexte fourni ne précise pas..."

**Après :**
```markdown
## Réponse Directe

Le **Code du Travail Ivoirien 2023** contient **357 articles** au total.

### Détail de la structure

Le Code est organisé en :
- **12 titres** couvrant différents aspects du droit du travail
- **45 chapitres** regroupant les dispositions par thème
- **357 articles** numérotés de 1 à 357

### Source

(Source : Code du Travail Ivoirien 2023, Table des matières)
```

### Pour l'Analyse

**Avant :**
> "Le document contient environ 6 000 caractères..."

**Après :**
```markdown
## 📄 Nature du Document

**Type** : Rapport juridique
**Origine** : UNESCO - Conférence générale, 28e session
**Date** : 8 novembre 1995
**Référence** : Document 28 C/142

### Contexte

Ce document est le huitième rapport du Comité juridique de l'UNESCO, 
présenté lors de la 28e session de la Conférence générale à Paris en 1995. 
Il traite des communications reçues des États membres concernant 
l'application de l'article IV.C, paragraphe 8 (c), de l'Acte constitutif 
de l'UNESCO.

[... 800+ mots supplémentaires ...]
```

---

## 🚀 Prochaines Étapes

1. **Tester avec documents réels**
   - Code du Travail Ivoirien
   - Contrats types
   - Rapports juridiques

2. **Ajuster si nécessaire**
   - Affiner les instructions
   - Ajouter des exemples spécifiques
   - Optimiser la longueur

3. **Ajouter des capacités spécialisées**
   - Comparaison de documents
   - Génération de synthèses
   - Analyse de conformité

---

## 📝 Notes Techniques

### Fichiers Modifiés

1. `/home/ubuntu/services/llama-api.services.ts`
   - Prompt de chat conversationnel (lignes 383-570+)
   - Import du nouveau prompt d'analyse (ligne 6)
   - Fonction getDocumentAnalysisPrompt (lignes 227-230)

2. `/home/ubuntu/services/documentAnalysisPrompt.ts` (NOUVEAU)
   - Fonction getAdvancedDocumentAnalysisPrompt
   - 2500+ mots de prompt structuré
   - Exemples et templates complets

### Compatibilité

- ✅ Compatible avec l'API Manus existante
- ✅ Pas de changement dans les interfaces TypeScript
- ✅ Backward compatible (ancien prompt conservé en backup)

---

**Date** : 25 novembre 2024  
**Version** : 3.0 - Prompts Système Avancés  
**Auteur** : Manus AI Assistant
