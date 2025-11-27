#!/bin/bash
# Script de démarrage de l'API de génération de documents Word

echo "🚀 Démarrage de l'API de génération de documents Word..."

# Vérifier si l'API est déjà en cours d'exécution
if pgrep -f "node server.cjs" > /dev/null; then
    echo "⚠️  L'API est déjà en cours d'exécution"
    echo "Pour la redémarrer, arrêtez-la d'abord avec: pkill -f 'node server.cjs'"
    exit 1
fi

# Démarrer l'API
cd /home/ubuntu
node server.cjs > /tmp/api-server.log 2>&1 &
API_PID=$!

# Attendre que l'API démarre
sleep 2

# Vérifier que l'API fonctionne
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API démarrée avec succès (PID: $API_PID)"
    echo "📝 Logs: tail -f /tmp/api-server.log"
    echo "🌐 Endpoint: http://localhost:3001/api/generate-docx"
else
    echo "❌ Erreur lors du démarrage de l'API"
    echo "📝 Consultez les logs: cat /tmp/api-server.log"
    exit 1
fi
