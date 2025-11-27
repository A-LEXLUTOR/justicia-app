# Guide d'Utilisation : Génération de Documents Word avec Papier à En-tête PORTEO

## 📋 Vue d'ensemble

Justicia peut maintenant générer des documents Word (.docx) professionnels avec le **papier à en-tête PORTEO GROUP** automatiquement intégré.

## 🎯 Fonctionnalités

### ✅ Ce qui est inclus automatiquement :
- **Logo PORTEO GROUP** en haut à gauche
- **Fond décoratif** avec cercles géométriques en filigrane gris clair
- **Formatage professionnel** du contenu (titres, paragraphes, listes)
- **Mise en page** avec marges appropriées

### 📝 Formats supportés :
- **Titres** : `# Titre 1`, `## Titre 2`, `### Titre 3`
- **Gras** : `**texte en gras**`
- **Italique** : `*texte en italique*`
- **Listes à puces** : `- élément`
- **Listes numérotées** : `1. élément`
- **Citations** : `> citation`
- **Code inline** : `` `code` ``

## 🚀 Utilisation dans Justicia

### Méthode 1 : Depuis un message de Justicia

1. Posez une question ou demandez à Justicia de générer un document
2. Attendez la réponse de Justicia
3. **Survolez le message** de Justicia avec la souris
4. Cliquez sur le bouton **"Word"** (orange) qui apparaît
5. Le document Word est téléchargé automatiquement avec le papier à en-tête PORTEO

### Méthode 2 : Depuis un modèle pré-rempli

1. Cliquez sur **+ → Créer un document → Depuis un Modèle**
2. Sélectionnez un modèle (ex: Courrier de Validation de Plans)
3. Remplissez le formulaire avec les informations requises
4. Cliquez sur **"Générer le Document"**
5. Attendez que Justicia génère le contenu
6. Survolez le message de Justicia et cliquez sur **"Word"**

## 🔧 Architecture Technique

### Composants :

1. **Frontend** (`/home/ubuntu/components/ChatMessage.tsx`)
   - Bouton "Word" dans l'interface
   - Appel à l'API `/api/generate-docx`

2. **API Backend** (`/home/ubuntu/server.cjs`)
   - Serveur Express sur le port 3001
   - Endpoint POST `/api/generate-docx`
   - Traitement des requêtes de génération

3. **Script Python** (`/home/ubuntu/public/templates/generate_docx_with_header.py`)
   - Conversion Markdown → Word
   - Intégration du papier à en-tête
   - Formatage professionnel

4. **Template** (`/home/ubuntu/public/templates/porteo_header.docx`)
   - Papier à en-tête PORTEO GROUP original
   - Logo et fond décoratif

### Flux de données :

```
Utilisateur clique "Word"
    ↓
Frontend envoie POST /api/generate-docx
    ↓
API reçoit le contenu Markdown
    ↓
API appelle le script Python
    ↓
Script génère le .docx avec en-tête
    ↓
API renvoie le fichier au navigateur
    ↓
Téléchargement automatique
```

## 🛠️ Démarrage du système

### 1. Démarrer l'API Backend

```bash
cd /home/ubuntu
node server.cjs > /tmp/api-server.log 2>&1 &
```

### 2. Vérifier que l'API fonctionne

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{"status":"OK","message":"API de génération de documents Word opérationnelle"}
```

### 3. Démarrer Vite (si nécessaire)

```bash
cd /home/ubuntu
npm run dev
```

## 🧪 Test de l'API

### Test via curl :

```bash
curl -X POST http://localhost:3001/api/generate-docx \
  -H "Content-Type: application/json" \
  -d '{"content":"# Mon Document\n\n**PORTEO BTP** est une entreprise leader.\n\n## Services\n\n- Construction\n- Génie civil\n- BTP"}' \
  --output test_document.docx
```

### Test via l'interface :

1. Ouvrez Justicia
2. Posez une question : "Génère un contrat de sous-traitance"
3. Attendez la réponse
4. Cliquez sur "Word"
5. Vérifiez que le document téléchargé contient le papier à en-tête PORTEO

## 📊 Logs et Débogage

### Logs de l'API :

```bash
tail -f /tmp/api-server.log
```

### Logs de Vite :

```bash
# Vite affiche les logs dans le terminal où il a été démarré
```

### Vérifier les processus :

```bash
# API Backend
ps aux | grep "node server.cjs"

# Vite
ps aux | grep vite
```

## 🔒 Sécurité

- L'API accepte uniquement du contenu Markdown (pas de code exécutable)
- Les fichiers temporaires sont nettoyés automatiquement
- CORS configuré pour accepter uniquement les requêtes depuis Vite

## 📦 Fichiers Importants

```
/home/ubuntu/
├── server.cjs                              # API Backend Express
├── vite.config.js                          # Configuration Vite avec proxy
├── components/
│   └── ChatMessage.tsx                     # Composant avec bouton "Word"
└── public/
    └── templates/
        ├── porteo_header.docx              # Template avec papier à en-tête
        └── generate_docx_with_header.py    # Script de génération
```

## 🎨 Personnalisation

### Modifier le papier à en-tête :

1. Remplacez `/home/ubuntu/public/templates/porteo_header.docx` par votre nouveau template
2. Assurez-vous que le logo et le fond sont dans l'en-tête du document
3. Redémarrez l'API

### Modifier le formatage :

Éditez `/home/ubuntu/public/templates/generate_docx_with_header.py` :
- Marges : lignes 59-62
- Styles de titres : lignes 77-81
- Formatage du texte : lignes 95-108

## ❓ Dépannage

### Le bouton "Word" ne fonctionne pas :

1. Vérifiez que l'API est démarrée : `curl http://localhost:3001/api/health`
2. Vérifiez les logs : `tail -f /tmp/api-server.log`
3. Vérifiez la configuration proxy dans `vite.config.js`

### Le document généré n'a pas de papier à en-tête :

1. Vérifiez que le template existe : `ls -lh /home/ubuntu/public/templates/porteo_header.docx`
2. Vérifiez les logs du script Python dans `/tmp/api-server.log`

### Erreur "Erreur lors de la génération" :

1. Vérifiez que Python 3.11 est installé : `python3.11 --version`
2. Vérifiez que python-docx est installé : `pip3 list | grep python-docx`
3. Consultez les logs détaillés : `tail -50 /tmp/api-server.log`

## 🎉 Exemples d'utilisation

### Exemple 1 : Contrat de sous-traitance

**Demande à Justicia :**
> "Génère un contrat de sous-traitance entre PORTEO BTP et une entreprise de terrassement"

**Résultat :**
- Document Word avec papier à en-tête PORTEO
- Contrat complet avec toutes les clauses
- Formatage professionnel

### Exemple 2 : Courrier de mise en demeure

**Demande à Justicia :**
> "Crée un courrier de mise en demeure pour retard de travaux"

**Résultat :**
- Document Word avec papier à en-tête PORTEO
- Courrier juridique formel
- Références aux articles du Code du Travail

### Exemple 3 : Depuis un modèle

**Actions :**
1. + → Créer un document → Depuis un Modèle
2. Sélectionner "Courrier de Validation de Plans"
3. Remplir : Lieu, Date, Destinataire
4. Générer le Document
5. Cliquer sur "Word"

**Résultat :**
- Document Word avec papier à en-tête PORTEO
- Contenu pré-rempli avec les informations PORTEO BTP
- Valeurs du formulaire intégrées

## 📞 Support

Pour toute question ou problème :
- Consultez les logs : `/tmp/api-server.log`
- Vérifiez la documentation technique dans ce fichier
- Testez l'API directement avec curl

---

**Version :** 1.0  
**Date :** 26 novembre 2025  
**Auteur :** Système Justicia
