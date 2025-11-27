# Déploiement de Justicia - Informations d'Accès

## 🚀 Statut du Déploiement

Le projet **Justicia** (anciennement Flagr) a été déployé avec succès sur le serveur de développement.

## 🌐 Accès à l'Application

**URL publique :** https://5173-i1qym2pbbc9e6c4xxwq2z-774479a2.manusvm.computer

L'application est maintenant accessible via cette URL et prête pour le développement d'améliorations.

## 📂 Structure du Projet

Le projet est situé dans : `/home/ubuntu/`

### Fichiers et Dossiers Principaux

- **App.tsx** - Composant principal de l'application
- **components/** - Composants React réutilisables
  - AnalysisLoadingView.tsx
  - AnalysisModal.tsx
  - AnalysisResultsView.tsx
  - ChatInput.tsx
  - ChatMessage.tsx
  - ChatPanel.tsx
  - ChatView.tsx
  - InitialView.tsx
  - LoginPage.tsx
  - Sidebar.tsx
  - UserProfile.tsx
- **services/** - Services et intégrations
  - documentParser.ts - Analyse et extraction de documents
  - firebaseService.ts - Intégration Firebase
  - llama-api.services.ts - Intégration API Llama pour l'IA
  - storageService.ts - Gestion du stockage local
- **public/** - Ressources statiques
- **package.json** - Configuration et dépendances du projet

## 🛠️ Technologies Utilisées

- **Frontend :** React 19.1.0 + TypeScript
- **Build Tool :** Vite 7.0.0
- **Styling :** Tailwind CSS 4.1.11
- **Animations :** Framer Motion 11.3.12
- **IA/ML :** Google GenAI, Ollama
- **Backend :** Firebase 11.9.1
- **Traitement de Documents :** PDF.js, Mammoth, Tesseract.js, XLSX

## 💻 Commandes de Développement

### Démarrer le serveur de développement
```bash
cd /home/ubuntu
pnpm run dev
```

### Build de production
```bash
pnpm run build
```

### Prévisualiser le build de production
```bash
pnpm run preview
```

### Linter
```bash
pnpm run lint
```

## 📋 Fonctionnalités Principales

### 🔥 Capacités Principales
- **📄 Upload & Analyse de Documents** - Support de multiples formats avec extraction intelligente
- **🤖 Analyse Alimentée par l'IA** - Analyse de documents avec modèles de langage avancés
- **💬 Interface de Chat Interactive** - Conversations en langage naturel sur vos documents
- **🔐 Authentification Utilisateur** - Connexion sécurisée et gestion de profil
- **💾 Stockage Local** - Persistance de l'historique des chats et préférences
- **📊 Visualisation des Résultats** - Affichage complet des insights d'analyse

## 🔧 Configuration du Serveur

- **Port :** 5173
- **Host :** 0.0.0.0 (accessible depuis l'extérieur)
- **HMR (Hot Module Replacement) :** Activé sur le port 5173

## 📝 Notes Importantes

1. Le serveur de développement est actuellement en cours d'exécution dans la session `dev_server`
2. Les modifications du code seront automatiquement rechargées grâce au HMR
3. Les limites de file watchers ont été augmentées pour éviter les erreurs ENOSPC
4. Le projet utilise pnpm comme gestionnaire de paquets

## 🔄 Prochaines Étapes pour le Développement

Pour développer des améliorations :

1. Accédez à l'application via l'URL fournie
2. Identifiez les fonctionnalités à améliorer
3. Modifiez les fichiers sources dans `/home/ubuntu/`
4. Les changements seront automatiquement reflétés dans le navigateur
5. Testez vos modifications en temps réel

## 📚 Documentation Supplémentaire

- **README.md** - Documentation complète du projet
- **AMELIORATIONS_JUSTICIA.md** - Liste des améliorations prévues
- **MODE_COLLABORATIF_GUIDE.md** - Guide du mode collaboratif
- **SYSTEME_RAG_GUIDE.md** - Guide du système RAG
- **PORTEO_GUIDELINE_NOTES.md** - Notes de guidelines

---

**Date de déploiement :** 25 novembre 2025  
**Environnement :** Serveur de développement Vite  
**Statut :** ✅ Opérationnel
