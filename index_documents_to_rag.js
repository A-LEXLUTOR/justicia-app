/**
 * Script pour indexer tous les documents extraits dans la base RAG de Justicia
 * Utilise directement IndexedDB via jsdom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simuler l'environnement navigateur
import { JSDOM } from 'jsdom';
const dom = new JSDOM('', {
  url: 'http://localhost:5173',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Polyfill pour IndexedDB
import 'fake-indexeddb/auto';

// Importer les services RAG
const extractedTextsDir = path.join(__dirname, 'extracted_texts');

// Fonction simplifiée pour chunker le texte
function chunkText(text, chunkSize = 4000, overlap = 200) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);
    chunks.push(chunk);
    start = end - overlap;
    
    if (start >= text.length) break;
  }
  
  return chunks;
}

// Fonction pour indexer un document
async function indexDocument(fileName, text, docType = 'other') {
  console.log(`\n📄 Indexation: ${fileName}`);
  console.log(`   ${text.length.toLocaleString()} caractères`);
  
  // Chunker le texte
  const chunks = chunkText(text);
  console.log(`   ${chunks.length} chunks créés`);
  
  // Sauvegarder dans un fichier JSON pour import manuel
  const docData = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: fileName,
    type: docType,
    content: text,
    chunks: chunks.map((chunk, index) => ({
      id: `chunk_${Date.now()}_${index}`,
      documentId: fileName,
      content: chunk,
      index: index,
      metadata: {
        charCount: chunk.length,
        position: index
      }
    })),
    metadata: {
      charCount: text.length,
      chunkCount: chunks.length,
      indexed: new Date().toISOString()
    }
  };
  
  return docData;
}

async function main() {
  try {
    console.log('🚀 Indexation de tous les documents dans la base RAG\n');
    
    // Lire tous les fichiers .txt
    const files = fs.readdirSync(extractedTextsDir)
      .filter(f => f.endsWith('.txt') && f !== '_extraction_summary.txt')
      .sort();
    
    console.log(`📚 ${files.length} documents à indexer\n`);
    
    const allDocuments = [];
    let totalChars = 0;
    let totalChunks = 0;
    
    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const filePath = path.join(extractedTextsDir, fileName);
      
      console.log(`[${i + 1}/${files.length}] ${fileName}`);
      
      // Lire le contenu
      const text = fs.readFileSync(filePath, 'utf-8');
      
      // Déterminer le type
      let docType = 'other';
      if (fileName.includes('code-du-travail')) {
        docType = 'legal_code';
      } else if (fileName.includes('CONTRAT') || fileName.includes('CONVENTION')) {
        docType = 'contract';
      } else if (fileName.includes('COURRIER') || fileName.includes('MODELE')) {
        docType = 'template';
      } else if (fileName.includes('Analyses') || fileName.includes('Rapport')) {
        docType = 'report';
      }
      
      // Indexer
      const docData = await indexDocument(fileName.replace('.txt', ''), text, docType);
      allDocuments.push(docData);
      
      totalChars += text.length;
      totalChunks += docData.chunks.length;
    }
    
    // Sauvegarder tous les documents dans un fichier JSON
    const outputFile = path.join(__dirname, 'rag_indexed_documents.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      documents: allDocuments,
      metadata: {
        totalDocuments: allDocuments.length,
        totalCharacters: totalChars,
        totalChunks: totalChunks,
        indexedAt: new Date().toISOString()
      }
    }, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ INDEXATION TERMINÉE');
    console.log('='.repeat(60));
    console.log(`Documents: ${allDocuments.length}`);
    console.log(`Caractères: ${totalChars.toLocaleString()}`);
    console.log(`Chunks: ${totalChunks.toLocaleString()}`);
    console.log(`\n📁 Fichier JSON créé: ${outputFile}`);
    console.log('\nImportez ce fichier dans Justicia via l\'interface web.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
