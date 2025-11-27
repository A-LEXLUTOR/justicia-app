# 📚 Guide du Système RAG de JUSTICIA

## 🎯 Qu'est-ce que le RAG ?

**RAG** (Retrieval-Augmented Generation) est un système qui permet à l'IA de consulter une base de connaissances pour enrichir ses réponses avec des informations précises et contextuelles.

---

## ✨ Fonctionnalités Activées

### 1. **Stockage Automatique des Documents** ✅

Chaque document que vous uploadez dans JUSTICIA est automatiquement :
- ✅ **Stocké dans IndexedDB** (base de données locale du navigateur)
- ✅ **Découpé en chunks** (morceaux de texte optimisés)
- ✅ **Converti en embeddings vectoriels** (représentation sémantique via OpenAI)
- ✅ **Indexé pour recherche sémantique** (recherche par sens, pas par mots-clés)

### 2. **Code du Travail Ivoirien 2023** ✅

Le Code du Travail Ivoirien est automatiquement chargé au démarrage de l'application :
- **13 697 lignes** de législation
- **610 355 caractères** de contenu juridique
- **Disponible en permanence** pour toutes les analyses

### 3. **Consultation Automatique par l'IA** ✅

Lors de chaque analyse ou conversation, l'IA :
1. Recherche les documents pertinents dans la base RAG
2. Extrait les passages les plus pertinents
3. Utilise ces informations pour enrichir sa réponse
4. Cite les sources utilisées

---

## 🔧 Architecture Technique

### **Stockage Persistant**

```
IndexedDB (Navigateur)
├── Documents Store
│   ├── ID
│   ├── Nom
│   ├── Contenu
│   ├── Type
│   ├── Date d'upload
│   └── Métadonnées
│
└── Embeddings Store
    ├── ID
    ├── Document ID
    ├── Chunk (morceau de texte)
    └── Vecteur (embedding OpenAI)
```

### **Flux de Traitement**

```
1. Upload Document
   ↓
2. Extraction Texte (PDF, Word, Excel, etc.)
   ↓
3. Nettoyage & Découpage en Chunks
   ↓
4. Génération Embeddings (OpenAI text-embedding-3-small)
   ↓
5. Stockage IndexedDB
   ↓
6. Disponible pour Recherche Sémantique
```

### **Recherche Sémantique**

```
1. Question de l'utilisateur
   ↓
2. Génération Embedding de la question
   ↓
3. Calcul Similarité Cosinus avec tous les chunks
   ↓
4. Sélection des Top 5 chunks les plus pertinents
   ↓
5. Injection dans le contexte de l'IA
   ↓
6. Génération de la réponse enrichie
```

---

## 📊 Utilisation

### **Accéder à la Base de Connaissances**

1. Cliquez sur le bouton **"Base de Connaissances"** dans la sidebar
2. Vous verrez tous les documents indexés
3. Vous pouvez :
   - 📄 Voir les détails de chaque document
   - 🗑️ Supprimer des documents
   - 📊 Voir les statistiques (nombre de documents, embeddings, etc.)
   - 🔄 Rafraîchir la liste

### **Documents Automatiquement Indexés**

Tous les formats supportés sont automatiquement ajoutés au RAG :
- ✅ PDF
- ✅ Word (.docx)
- ✅ Excel (.xlsx, .xls)
- ✅ Texte (.txt, .md, .rtf)
- ✅ HTML, XML
- ✅ Images (via OCR)

### **Code du Travail Ivoirien**

Le Code du Travail est automatiquement chargé au démarrage. Pour vérifier :
1. Ouvrez la **Base de Connaissances**
2. Vous devriez voir : **"Code du Travail Ivoirien 2023"**
3. Ce document est marqué comme **"référence"** et ne peut pas être supprimé accidentellement

---

## 🎓 Exemples d'Utilisation

### **Exemple 1 : Analyse de Contrat avec Référence au Code du Travail**

```
Utilisateur : Upload un contrat de travail
↓
JUSTICIA :
1. Analyse le contrat
2. Consulte le Code du Travail Ivoirien
3. Détecte les clauses non conformes
4. Cite les articles pertinents du Code
5. Propose des corrections
```

### **Exemple 2 : Question Juridique**

```
Utilisateur : "Quelle est la durée maximale du travail en Côte d'Ivoire ?"
↓
JUSTICIA :
1. Recherche dans le Code du Travail
2. Trouve l'article pertinent
3. Répond avec citation exacte
4. Explique les exceptions
```

### **Exemple 3 : Comparaison de Documents**

```
Utilisateur : Upload plusieurs contrats
↓
JUSTICIA :
1. Stocke tous les contrats dans le RAG
2. Peut comparer les clauses
3. Détecte les différences
4. Identifie les meilleures pratiques
```

---

## 🔐 Sécurité et Confidentialité

### **Stockage Local**

- ✅ Tous les documents sont stockés **localement** dans votre navigateur
- ✅ **Aucune donnée** n'est envoyée à un serveur externe (sauf pour les embeddings OpenAI)
- ✅ Les documents restent **privés** et accessibles uniquement par vous

### **Embeddings OpenAI**

- ⚠️ Les chunks de texte sont envoyés à OpenAI pour générer les embeddings
- ✅ OpenAI ne stocke **pas** les données selon leur politique
- ✅ Les embeddings sont stockés **localement** dans IndexedDB

### **Suppression des Données**

Pour supprimer toutes les données :
1. Ouvrez la **Base de Connaissances**
2. Cliquez sur **"Vider la Base"**
3. Ou supprimez les données IndexedDB depuis les DevTools du navigateur

---

## 📈 Statistiques et Monitoring

### **Voir les Statistiques**

Dans la Base de Connaissances, vous pouvez voir :
- 📊 **Nombre de documents** indexés
- 🧩 **Nombre de chunks** (morceaux de texte)
- 🔢 **Nombre d'embeddings** générés
- 💾 **Taille du cache** en mémoire

### **Performance**

- **Recherche** : < 100ms pour trouver les documents pertinents
- **Indexation** : ~2-5 secondes par document (selon la taille)
- **Stockage** : Illimité (limité par l'espace disque du navigateur)

---

## 🛠️ Maintenance

### **Réinitialiser le Code du Travail**

Si le Code du Travail est corrompu ou manquant :
1. Ouvrez la console du navigateur (F12)
2. Exécutez :
```javascript
localStorage.removeItem('justicia_code_travail_id');
location.reload();
```

### **Vider Complètement le RAG**

Pour repartir de zéro :
1. Base de Connaissances → **"Vider la Base"**
2. Ou dans la console :
```javascript
indexedDB.deleteDatabase('JusticiaRAG');
location.reload();
```

---

## 🚀 Prochaines Améliorations Possibles

- [ ] Export de la base de connaissances
- [ ] Import de bases de connaissances partagées
- [ ] Recherche avancée avec filtres
- [ ] Visualisation des relations entre documents
- [ ] Suggestions automatiques de documents pertinents

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur (F12)
2. Recherchez les messages `[RAG]` pour le diagnostic
3. Contactez le support si le problème persiste

---

**JUSTICIA est maintenant équipé d'une mémoire permanente et intelligente ! 🧠✨**

