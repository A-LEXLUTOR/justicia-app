# Guide de Configuration du Système TTS (Text-to-Speech)

## 🎯 Vue d'ensemble

Justicia utilise maintenant l'**API OpenAI TTS** pour fournir une voix naturelle et professionnelle au lieu de la voix robotique du navigateur.

Le système est conçu pour fonctionner sur **n'importe quel hébergeur** en utilisant un backend proxy qui sécurise votre clé API OpenAI.

---

## 🏗️ Architecture

```
Frontend (React)
    ↓
/api/tts (Vite proxy)
    ↓
Backend Express (port 3001)
    ↓
API OpenAI TTS
```

### Avantages de cette architecture :
- ✅ **Sécurité** : La clé API OpenAI reste côté serveur
- ✅ **Portabilité** : Fonctionne sur n'importe quel hébergeur
- ✅ **Voix naturelle** : Utilise les voix OpenAI (nova, alloy, echo, etc.)
- ✅ **Fallback** : Bascule automatiquement sur la voix du navigateur en cas d'erreur

---

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Configuration OpenAI
OPENAI_API_KEY=sk-proj-VOTRE_CLE_API_ICI
```

**Obtenir une clé API OpenAI** :
1. Allez sur https://platform.openai.com/api-keys
2. Créez un nouveau projet (si nécessaire)
3. Générez une nouvelle clé API
4. Copiez la clé dans le fichier `.env`

### 2. Installation des dépendances

```bash
npm install dotenv
```

### 3. Démarrage des serveurs

#### Serveur API (port 3001)
```bash
node server.cjs
```

#### Serveur Vite (port 5173)
```bash
npm run dev
```

---

## 🎤 Utilisation

### Dans l'interface Justicia

1. Posez une question ou générez un document
2. Survolez le message de Justicia
3. Cliquez sur le bouton **"Écouter"** (violet)
4. La voix OpenAI lit le contenu

### Choix de la voix

Par défaut, Justicia utilise la voix **"nova"**. Vous pouvez changer la voix dans le code :

```typescript
// Dans components/ChatMessage.tsx, ligne 171
speakTextWithOpenAI(message.content, () => setIsSpeaking(false), 'nova');
```

**Voix disponibles** :
- `alloy` : Voix neutre et équilibrée
- `echo` : Voix masculine
- `fable` : Voix britannique
- `onyx` : Voix grave et profonde
- `nova` : Voix féminine et dynamique (par défaut)
- `shimmer` : Voix douce et chaleureuse

---

## 🚀 Déploiement sur votre hébergeur

### 1. Préparer les fichiers

Copiez ces fichiers sur votre serveur :
- `server.cjs` : Serveur API
- `.env` : Variables d'environnement (avec votre clé API)
- `package.json` : Dépendances
- Tous les fichiers du projet Justicia

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer le serveur API

```bash
# En production, utilisez PM2 ou un gestionnaire de processus
pm2 start server.cjs --name justicia-api

# Ou avec node directement
node server.cjs &
```

### 4. Configurer le proxy Vite

Le fichier `vite.config.js` contient déjà la configuration proxy :

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### 5. Build et déploiement

```bash
# Build de production
npm run build

# Les fichiers statiques sont dans le dossier dist/
# Déployez-les sur votre hébergeur (Nginx, Apache, etc.)
```

---

## 🔧 Dépannage

### La voix est robotique

**Cause** : L'API OpenAI TTS n'est pas accessible ou la clé API est invalide.

**Solution** :
1. Vérifiez que le serveur API est démarré : `curl http://localhost:3001/api/health`
2. Vérifiez que la clé API est correcte dans `.env`
3. Vérifiez les logs du serveur : `tail -f /tmp/api-server.log`

### Erreur "Clé API OpenAI non configurée"

**Cause** : Le fichier `.env` n'est pas chargé ou la variable n'est pas définie.

**Solution** :
1. Vérifiez que le fichier `.env` existe à la racine du projet
2. Vérifiez que `dotenv` est installé : `npm install dotenv`
3. Redémarrez le serveur API

### Le bouton "Écouter" ne fait rien

**Cause** : Le proxy Vite ne redirige pas correctement vers le serveur API.

**Solution** :
1. Vérifiez que Vite est démarré : `ps aux | grep vite`
2. Vérifiez la configuration proxy dans `vite.config.js`
3. Ouvrez la console du navigateur pour voir les erreurs

---

## 📊 Coûts

L'API OpenAI TTS coûte **$15 / 1 million de caractères**.

**Exemple** :
- 1000 caractères (environ 150 mots) = $0.015 (1.5 centimes)
- Un document de 10 pages ≈ 5000 caractères = $0.075 (7.5 centimes)

**Optimisation** :
- Le système ne génère l'audio qu'à la demande (clic sur "Écouter")
- L'audio n'est pas mis en cache (pour économiser l'espace disque)
- Vous pouvez limiter la longueur du texte envoyé à l'API

---

## 🎉 Résultat

Votre système Justicia dispose maintenant d'une **voix professionnelle et naturelle** qui fonctionne sur n'importe quel hébergeur !
