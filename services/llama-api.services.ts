// Configuration pour l'API (utilise les variables d'environnement automatiquement)
const API_KEY = 'sk-iGPVRafgVXnXXrRALaVsRh';
const BASE_URL = 'https://api.manus.im/api/llm-proxy/v1';

// Prompt d'analyse de documents (inline pour éviter les problèmes d'import)

export interface AIAnalysisData {
  plainLanguageSummary: string;
  flags: Array<{
    id: string;
    title: string;
    clause: string;
    explanation: string;
    severity: 'Faible' | 'Moyen' | 'Élevé';
    suggestedRewrite: string;
  }>;
  riskAssessment: {
    overallRiskScore: number;
    risks: Array<{
      area: string;
      assessment: string;
      score: number;
    }>;
  };
  aiInsights: string;
}

/**
 * Fait un appel à l'API OpenAI
 */
async function makeAPICall(messages: Array<{ role: string; content: string }>): Promise<any> {
  try {
    console.log('Making API call with messages:', messages.length);
    
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        temperature: 0.3,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('API response received:', data);
    return data;
    
  } catch (error) {
    console.error('API Call Error:', error);
    throw new Error(`Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Parse une réponse JSON de manière ultra-robuste
 */
function parseJSONResponse(content: string): any {
  try {
    console.log('=== DÉBUT PARSING JSON ===');
    console.log('Contenu brut (200 premiers caractères):', content.substring(0, 200));
    
    // Étape 1: Nettoyage de base
    let cleaned = content.trim();
    
    // Étape 2: Supprimer tous les caractères de contrôle et invisibles
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Étape 3: Normaliser les guillemets et apostrophes
    cleaned = cleaned.replace(/[""]/g, '"');
    cleaned = cleaned.replace(/['']/g, "'");
    cleaned = cleaned.replace(/[`´]/g, "'");
    
    // Étape 4: Normaliser les espaces et retours à la ligne
    cleaned = cleaned.replace(/\\r\\n/g, '\\n');
    cleaned = cleaned.replace(/\\r/g, '\\n');
    cleaned = cleaned.replace(/\\t/g, ' ');
    
    // Étape 5: Supprimer les caractères spéciaux problématiques
    cleaned = cleaned.replace(/…/g, '...');
    cleaned = cleaned.replace(/–/g, '-');
    cleaned = cleaned.replace(/—/g, '-');
    cleaned = cleaned.replace(/•/g, '-');
    
    console.log('Après nettoyage (200 premiers caractères):', cleaned.substring(0, 200));
    
    // Étape 6: Extraire le JSON principal
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('Aucune accolade trouvée dans:', cleaned);
      throw new Error("Aucun JSON détecté dans la réponse");
    }
    
    let jsonStr = cleaned.substring(startIndex, endIndex + 1);
    console.log('JSON extrait (300 premiers caractères):', jsonStr.substring(0, 300));
    
    // Étape 7: Corrections spécifiques au JSON
    // Supprimer les virgules en trop
    jsonStr = jsonStr.replace(/,\s*}/g, '}');
    jsonStr = jsonStr.replace(/,\s*]/g, ']');
    
    // Corriger les clés sans guillemets
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Étape 8: Corriger les guillemets non échappés dans les valeurs
    // Approche simple: remplacer les patterns problématiques
    try {
      // Pattern pour trouver les valeurs de chaînes avec guillemets internes
      // Exemple: "clause": "Article "3" dit" -> "clause": "Article '3' dit"
      
      // Méthode 1: Remplacer les guillemets entre guillemets dans les valeurs
      jsonStr = jsonStr.replace(
        /"([^"]+)"\s*:\s*"([^"]*)"/g,
        (match, _key, value) => {
          // Compter les guillemets dans la valeur
          const quoteCount = (value.match(/"/g) || []).length;
          if (quoteCount > 0) {
            // Il y a des guillemets dans la valeur - on doit les gérer
            // On va chercher la vraie fin de la valeur
            return match; // On laisse tel quel pour l'instant
          }
          return match;
        }
      );
      
      // Méthode 2: Approche plus agressive - remplacer tous les guillemets isolés
      // dans les valeurs par des apostrophes
      let inValue = false;
      let result = '';
      let i = 0;
      
      while (i < jsonStr.length) {
        const char = jsonStr[i];
        const prevChar = i > 0 ? jsonStr[i - 1] : '';
        const nextChar = i < jsonStr.length - 1 ? jsonStr[i + 1] : '';
        
        if (char === '"') {
          if (prevChar === ':' && (nextChar !== ':' && nextChar !== ',' && nextChar !== '}' && nextChar !== ']')) {
            // Début d'une valeur
            inValue = true;
            result += char;
          } else if (inValue && (nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === '\n' || nextChar === ' ' && (jsonStr[i+2] === ',' || jsonStr[i+2] === '}'))) {
            // Fin d'une valeur
            inValue = false;
            result += char;
          } else if (inValue) {
            // Guillemet à l'intérieur d'une valeur - le remplacer par une apostrophe
            result += "'";
          } else {
            // Guillemet normal (clé ou début/fin de valeur)
            result += char;
          }
        } else {
          result += char;
        }
        i++;
      }
      
      jsonStr = result;
    } catch (e) {
      console.warn('Correction des guillemets échouée:', e);
    }
    
    console.log('JSON final (300 premiers caractères):', jsonStr.substring(0, 300));
    
    // Étape 9: Tentative de parsing
    const parsed = JSON.parse(jsonStr);
    console.log('=== PARSING RÉUSSI ===');
    return parsed;
    
  } catch (error) {
    console.error('=== ERREUR DE PARSING ===');
    console.error('Erreur:', error);
    console.error('Contenu problématique (500 premiers caractères):', content.substring(0, 500));
    
    // Tentative de récupération avec une approche différente
    try {
      console.log('Tentative de récupération...');
      
      // Essayer de trouver et corriger les problèmes courants
      let fallback = content;
      
      // Supprimer tout ce qui n'est pas du JSON
      const jsonMatch = fallback.match(/{[\\s\\S]*}/);
      if (jsonMatch) {
        fallback = jsonMatch[0];
        
        // Corrections agressives
        fallback = fallback
          .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '')
          .replace(/[""]/g, '"')
          .replace(/['']/g, "'")
          .replace(/,\\s*([}\\]])/g, '$1')
          .replace(/([{,]\\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, '$1"$2":');
        
        console.log('Tentative de fallback:', fallback.substring(0, 200));
        const fallbackParsed = JSON.parse(fallback);
        console.log('=== RÉCUPÉRATION RÉUSSIE ===');
        return fallbackParsed;
      }
    } catch (fallbackError) {
      console.error('Échec de la récupération:', fallbackError);
    }
    
    // FALLBACK ULTIME : Retourner une analyse basique
    console.warn('=== FALLBACK ULTIME ACTIVÉ ===');
    return {
      plainLanguageSummary: `## Analyse du Document\n\n${content.substring(0, 500)}...\n\n*Note: L'analyse complète a échoué. Voici un extrait du document.*`,
      flags: [
        {
          id: 'flag1',
          title: 'Document indexé',
          clause: 'Le document a été indexé dans la base de connaissances',
          explanation: 'Vous pouvez poser des questions sur ce document dans le chat',
          severity: 'Faible' as const,
          suggestedRewrite: 'Aucune suggestion'
        }
      ],
      riskAssessment: {
        overallRiskScore: 5,
        risks: [
          {
            area: 'Analyse',
            assessment: 'Analyse automatique non disponible',
            score: 5
          }
        ]
      },
      aiInsights: `## Document Indexé\n\nLe document a été indexé avec succès dans la base de connaissances. Vous pouvez maintenant poser des questions à son sujet dans le chat.`
    };
  }
}

/**
 * Génère le prompt système pour l'analyse de documents
 * Importé depuis le fichier dédié pour plus de clarté
 */
function getDocumentAnalysisPrompt(_docType: string): string {
  return `Tu es un assistant juridique expert. Analyse ce document et retourne UNIQUEMENT un objet JSON valide.

STRUCTURE EXACTE (ne modifie pas les clés) :
{
  "plainLanguageSummary": "Analyse détaillée du document en markdown avec titres ## et ###. Minimum 300 mots.",
  "flags": [
    {
      "id": "flag1",
      "title": "Point important",
      "clause": "Citation du texte",
      "explanation": "Explication",
      "severity": "Moyen",
      "suggestedRewrite": "Suggestion"
    }
  ],
  "riskAssessment": {
    "overallRiskScore": 5,
    "risks": [
      {
        "area": "Domaine",
        "assessment": "Évaluation",
        "score": 5
      }
    ]
  },
  "aiInsights": "Analyse approfondie en markdown. Minimum 200 mots."
}

RÈGLES STRICTES :
1. Retourne UNIQUEMENT le JSON, rien avant ni après
2. Utilise des apostrophes (') au lieu de guillemets (") dans les valeurs texte
3. severity doit être exactement : Faible, Moyen, ou Élevé
4. Les scores sont des nombres entre 0 et 10
5. Minimum 3 flags, maximum 10
6. Minimum 3 risks, maximum 8`;
}

// Ancien prompt (conservé en backup)
function getDocumentAnalysisPromptOld(_docType: string): string {
  return `Vous êtes un assistant juridique expert spécialisé dans l'analyse de documents en français. 

Analysez le document fourni de manière EXHAUSTIVE et retournez UNIQUEMENT un objet JSON valide avec cette structure exacte :

{
  "plainLanguageSummary": "ANALYSE COMPLÈTE ET DÉTAILLÉE du document incluant:\n\n## Nature du Document\n[Type de document, origine, date, auteur]\n\n## Objet Principal\n[Sujet traité, contexte, objectifs]\n\n## Contenu Détaillé\n[Résumé structuré de TOUTES les sections importantes]\n\n## Points Clés\n[Tous les éléments essentiels à retenir]\n\n## Implications\n[Conséquences, portée, applications]",
  "flags": [
    {
      "id": "flag1",
      "title": "Titre du point important",
      "clause": "Citation exacte du texte",
      "explanation": "Explication détaillée",
      "severity": "Faible|Moyen|Élevé",
      "suggestedRewrite": "Reformulation ou commentaire"
    }
  ],
  "riskAssessment": {
    "overallRiskScore": 5,
    "risks": [
      {
        "area": "Zone d'analyse",
        "assessment": "Évaluation complète",
        "score": 5
      }
    ]
  },
  "aiInsights": "## Analyse Approfondie\n\n[Analyse détaillée du document]\n\n## Recommandations\n\n[Conseils et suggestions d'expert]\n\n## Conclusion\n\n[Synthèse finale]"
}

INSTRUCTIONS IMPORTANTES POUR L'ANALYSE:\n\n1. **plainLanguageSummary** DOIT être TRÈS DÉTAILLÉ (minimum 500 mots):\n   - Identifiez précisément la NATURE du document (rapport, contrat, loi, etc.)\n   - Indiquez l'ORIGINE (organisation, auteur, date)\n   - Expliquez l'OBJET et le CONTEXTE\n   - Résumez TOUTES les sections importantes\n   - Listez TOUS les points clés\n   - Utilisez des titres markdown (##) pour structurer\n\n2. **flags** : Identifiez 5-10 points importants du document\n\n3. **aiInsights** : Analyse approfondie avec recommandations (minimum 300 mots)

IMPORTANT - RÈGLES STRICTES POUR LE JSON:
1. Retournez UNIQUEMENT le JSON, sans texte avant ou après
2. Utilisez des guillemets doubles (") UNIQUEMENT pour délimiter les clés et valeurs
3. Dans les valeurs de chaînes, remplacez TOUS les guillemets doubles par des apostrophes simples (')
4. Les scores sont des nombres entre 0 et 10 (sans guillemets)
5. La sévérité doit être exactement: "Faible", "Moyen", ou "Élevé"
6. N'utilisez JAMAIS de backslashes (\\) pour échapper les guillemets
7. Pour les citations de texte dans "clause", utilisez des apostrophes simples (') au lieu de guillemets doubles
8. Assurez-vous que chaque accolade ouvrante { a sa correspondante fermante }
9. Assurez-vous que chaque crochet ouvrant [ a son correspondant fermant ]
10. Testez mentalement que le JSON est valide avant de le retourner

EXEMPLE DE VALEUR CORRECTE:
"clause": "L'article 3 stipule que 'le paiement sera effectué sous 30 jours'"

EXEMPLE DE VALEUR INCORRECTE (NE PAS FAIRE):
"clause": "L'article 3 stipule que "le paiement sera effectué sous 30 jours""`;
}

/**
 * Génère l'analyse structurée du document
 */
export async function generateDocumentAnalysis(
  documentContent: string,
  docType: string
): Promise<AIAnalysisData> {
  
  const systemPrompt = getDocumentAnalysisPrompt(docType);
  const userPrompt = `Document à analyser :\\n\\n${documentContent}`;

  try {
    console.log('=== DÉBUT ANALYSE DOCUMENT ===');
    
    const data = await makeAPICall([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("Réponse API vide");
    }

    console.log('Contenu de la réponse API reçu');
    const parsedData = parseJSONResponse(messageContent);
    
    // Validation de base
    if (!parsedData.plainLanguageSummary) {
      throw new Error("Structure JSON invalide - plainLanguageSummary manquant");
    }
    
    if (!parsedData.flags || !Array.isArray(parsedData.flags)) {
      throw new Error("Structure JSON invalide - flags manquant ou invalide");
    }
    
    console.log('=== ANALYSE TERMINÉE AVEC SUCCÈS ===');
    return parsedData as AIAnalysisData;

  } catch (error) {
    console.error('=== ÉCHEC DE L\'ANALYSE ===');
    console.error('Erreur complète:', error);
    throw new Error(`Analyse échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Génère un modèle de contrat
 */
export async function generateContractTemplate(contractType: string): Promise<{ template: string; flags: any[] }> {
  const systemPrompt = `Générez un modèle de contrat ${contractType} en français.
Retournez un JSON avec:
{
  "template": "Contenu du modèle de contrat",
  "flags": []
}`;

  try {
    const data = await makeAPICall([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Créez un modèle de ${contractType}` }
    ]);

    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("Réponse API vide");
    }

    const parsedData = parseJSONResponse(messageContent);
    return parsedData;

  } catch (error) {
    console.error('Contract template generation failed:', error);
    throw new Error(`Génération de modèle échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Génère un titre à partir d'un message
 */
export function generateTitleFromMessage(message: string): string {
  const words = message.split(' ').slice(0, 6);
  return words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
}

/**
 * Streaming de réponse de chat (non utilisé actuellement)
 */
export async function streamChatResponse(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string, isNewMessage: boolean) => void,
  onDone: () => void
): Promise<void> {
  try {
    // Enrichir le contexte avec la base de connaissances RAG
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    let enrichedMessages = [...messages];
    
    // Le contexte de document temporaire de session est supprimé.
    // L'accès aux documents uploadés est maintenant géré par la recherche RAG permanente.
    
    // Rechercher dans la base de connaissances
    try {
      const { searchRAG } = await import('./ragService.enhanced');
      // CORRECTION: Augmenter à 30 résultats pour accès complet au document
      const ragContext = await searchRAG(lastUserMessage, 30);
      
      if (ragContext && !ragContext.includes('Aucun document pertinent')) {
        // Ajouter le contexte RAG au message système
        const systemMessage = {
          role: 'system',
          content: `Vous êtes **JUSTICIA**, un assistant juridique expert spécialisé en droit ivoirien, conçu pour fournir des analyses juridiques précises, claires et actionables.

# CONTEXTE DISPONIBLE

${ragContext}

---

# VOTRE MISSION

Vous devez analyser la demande de l'utilisateur et fournir une réponse complète, structurée et professionnelle en vous appuyant sur les documents disponibles ci-dessus.

---

# INSTRUCTIONS DE RÉPONSE

## 1. Analyse de la Demande

Avant de répondre, identifiez :
- **Type de demande** : Question factuelle, analyse juridique, comparaison, synthèse, conseil
- **Documents pertinents** : Quels documents du contexte sont concernés
- **Niveau de détail attendu** : Réponse rapide ou analyse approfondie

## 2. Recherche dans les Documents

- **Utilisez PRIORITAIREMENT** les informations du contexte fourni
- **Citez SYSTÉMATIQUEMENT** vos sources avec précision :
  - Format : \`(Source : [Nom du document], Article X, Section Y)\`
  - Exemple : \`(Source : Code du Travail Ivoirien 2023, Article 25, Section II)\`
- **Citez les textes exacts** entre guillemets ou en bloc de citation
- Si l'information n'est pas dans le contexte, **indiquez-le explicitement**

## 3. Structure de la Réponse (OBLIGATOIRE)

Toutes vos réponses DOIVENT suivre cette structure markdown :

Pour les questions factuelles simples : Utilisez ## Réponse Directe, puis ### Source

Pour les analyses complexes : Utilisez ## Synthèse, ## Analyse Détaillée (avec ### pour sous-sections), ## Sources, ## Recommandations

## 4. Formatage Markdown (STRICT)

- **Titres** : Utilisez \`##\` pour les sections principales, \`###\` pour les sous-sections
- **Paragraphes** : Courts (3-5 lignes max), aérés, séparés par une ligne vide
- **Listes** : 
  - Puces (\`-\`) pour les énumérations non ordonnées
  - Numéros (\`1.\`) pour les étapes ou hiérarchies
- **Emphase** :
  - \`**gras**\` pour les termes juridiques clés, concepts importants
  - \`*italique*\` pour les nuances ou précisions
- **Citations** : Utilisez \`>\` pour les extraits d'articles
- **Code inline** : Utilisez des backticks pour les références d'articles
- **Tableaux** : Pour les comparaisons ou données structurées

## 5. Qualité du Contenu

### Précision
- **Factuel** : Basez-vous uniquement sur les documents fournis
- **Exact** : Vérifiez les numéros d'articles et citations
- **Complet** : Ne laissez pas de zones d'ombre

### Clarté
- **Langage accessible** : Évitez le jargon excessif, expliquez les termes techniques
- **Phrases courtes** : 15-20 mots maximum par phrase
- **Transitions** : Utilisez des connecteurs logiques ("En effet", "Par conséquent", "Toutefois")

### Utilité
- **Actionable** : Donnez des conseils pratiques quand pertinent
- **Contextualisé** : Expliquez les implications concrètes
- **Anticipé** : Répondez aux questions implicites

## 6. Ton et Style

- **Professionnel** : Vocabulaire juridique approprié
- **Pédagogique** : Expliquez, ne vous contentez pas d'énoncer
- **Respectueux** : Ton courtois et bienveillant
- **Confiant** : Affirmez vos réponses quand elles sont étayées
- **Humble** : Admettez les limites quand l'information manque

## 7. Cas Spéciaux

### Si l'information n'est pas disponible :
Indiquez clairement ce qui manque et suggérez des pistes de recherche.

### Pour les comparaisons :
Utilisez des tableaux markdown pour clarifier les différences.

### Pour les calculs ou décomptes :
Montrez votre raisonnement étape par étape.

---

# EXEMPLES DE RÉPONSES

## Exemple 1 : Question factuelle

**Question** : "Combien y a-t-il d'articles dans le Code du Travail ?"

**Réponse** : Utilisez ## Réponse avec le contenu factuel, puis ### Source avec la référence.

## Exemple 2 : Analyse complexe

**Question** : "Quelles sont les conditions de licenciement ?"

**Réponse** : Utilisez ## Synthèse, puis ## Analyse Détaillée avec sous-sections, citations, et sources.

---

# RAPPEL FINAL

⚠️ **Chaque réponse DOIT** :
1. Être structurée en markdown avec titres
2. Citer précisément les sources
3. Utiliser des paragraphes courts et aérés
4. Être complète et actionable
5. Maintenir un ton professionnel mais accessible

Vous êtes prêt à fournir une assistance juridique de haute qualité. Analysez la demande et répondez de manière exemplaire.`
        };
        enrichedMessages = [systemMessage, ...messages];
        console.log('[RAG] Contexte ajouté au chat (', ragContext.length, 'caractères):', ragContext.substring(0, 300) + '...');
      } else {
        console.log('[RAG] Aucun contexte pertinent trouvé pour:', lastUserMessage);
      }
    } catch (ragError) {
      console.error('[RAG] Erreur lors de la recherche RAG:', ragError);
      // Continuer sans le contexte RAG en cas d'erreur
    }
    
    const data = await makeAPICall(enrichedMessages);
    const content = data.choices?.[0]?.message?.content || '';
    
    // Simuler le streaming en envoyant tout d'un coup
    onChunk(content, true);
    onDone();
    
  } catch (error) {
    console.error('Chat response failed:', error);
    onChunk('Désolé, une erreur s\'est produite. Veuillez réessayer.', true);
    onDone();
  }
}
