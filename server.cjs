require('dotenv').config();

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const https = require('https');

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS pour permettre les requêtes depuis Vite (port 5173)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

/**
 * POST /api/generate-docx
 * Génère un document Word avec papier à en-tête PORTEO
 */
app.post('/api/generate-docx', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Le contenu est requis' });
    }

    const timestamp = Date.now();
    const tempMdPath = `/tmp/content_${timestamp}.md`;
    const tempDocxPath = `/tmp/output_${timestamp}.docx`;
    const templatePath = path.join(__dirname, 'public/templates/porteo_header.docx');
    const scriptPath = path.join(__dirname, 'public/templates/generate_docx_with_header.py');

    try {
        console.log('[API] Génération de document Word demandée');
        
        // Écrire le contenu Markdown dans un fichier temporaire
        await writeFileAsync(tempMdPath, content, 'utf-8');
        console.log('[API] Contenu Markdown écrit:', tempMdPath);

        // Exécuter le script Python pour générer le document
        const command = `python3.11 "${scriptPath}" "${tempMdPath}" "${tempDocxPath}" "${templatePath}"`;
        console.log('[API] Exécution:', command);
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr && !stderr.includes('Document créé')) {
            console.error('[API] Erreur Python:', stderr);
            throw new Error(stderr);
        }

        console.log('[API] Document généré:', tempDocxPath);

        // Lire le fichier généré
        const docxBuffer = await readFileAsync(tempDocxPath);

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="document_porteo_${timestamp}.docx"`);
        res.send(docxBuffer);

        // Nettoyer les fichiers temporaires
        await unlinkAsync(tempMdPath).catch(err => console.error('[API] Erreur nettoyage MD:', err));
        await unlinkAsync(tempDocxPath).catch(err => console.error('[API] Erreur nettoyage DOCX:', err));

        console.log('[API] Document envoyé avec succès');
    } catch (error) {
        console.error('[API] Erreur lors de la génération:', error);
        
        // Nettoyer en cas d'erreur
        if (fs.existsSync(tempMdPath)) await unlinkAsync(tempMdPath).catch(() => {});
        if (fs.existsSync(tempDocxPath)) await unlinkAsync(tempDocxPath).catch(() => {});
        
        res.status(500).json({ 
            error: 'Erreur lors de la génération du document',
            details: error.message 
        });
    }
});

/**
 * POST /api/tts
 * Génère de l'audio avec OpenAI TTS
 */
app.post('/api/tts', async (req, res) => {
    const { text, voice = 'nova' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Le texte est requis' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Clé API OpenAI non configurée' });
    }

    try {
        console.log('[TTS] Génération audio demandée, voix:', voice);
        
        const postData = JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voice,
            response_format: 'mp3',
            speed: 1.0
        });

        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/audio/speech',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            if (apiRes.statusCode !== 200) {
                console.error('[TTS] Erreur API OpenAI:', apiRes.statusCode);
                return res.status(apiRes.statusCode).json({ error: 'Erreur API OpenAI' });
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            apiRes.pipe(res);
            console.log('[TTS] Audio envoyé avec succès');
        });

        apiReq.on('error', (error) => {
            console.error('[TTS] Erreur requête:', error);
            res.status(500).json({ error: 'Erreur lors de la génération audio' });
        });

        apiReq.write(postData);
        apiReq.end();
        
    } catch (error) {
        console.error('[TTS] Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la génération audio',
            details: error.message 
        });
    }
});

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API de génération de documents Word et TTS opérationnelle' });
});

app.listen(PORT, () => {
    console.log(`[SERVER] API de génération de documents Word démarrée sur le port ${PORT}`);
    console.log(`[SERVER] Endpoint: http://localhost:${PORT}/api/generate-docx`);
});
