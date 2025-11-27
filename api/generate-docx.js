/**
 * API endpoint pour générer des documents Word avec papier à en-tête PORTEO
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

/**
 * Génère un document Word avec papier à en-tête PORTEO
 * @param {string} markdownContent - Contenu au format Markdown
 * @returns {Promise<Buffer>} - Buffer du fichier .docx généré
 */
async function generateDocxWithHeader(markdownContent) {
  const timestamp = Date.now();
  const tempMdPath = `/tmp/content_${timestamp}.md`;
  const tempDocxPath = `/tmp/output_${timestamp}.docx`;
  const templatePath = path.join(__dirname, '../public/templates/porteo_header.docx');
  const scriptPath = path.join(__dirname, '../public/templates/generate_docx_with_header.py');

  try {
    // Écrire le contenu Markdown dans un fichier temporaire
    await writeFileAsync(tempMdPath, markdownContent, 'utf-8');

    // Exécuter le script Python pour générer le document
    const command = `python3.11 "${scriptPath}" "${tempMdPath}" "${tempDocxPath}" "${templatePath}"`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('Document créé')) {
      console.error('Erreur lors de la génération:', stderr);
      throw new Error(stderr);
    }

    // Lire le fichier généré
    const docxBuffer = await readFileAsync(tempDocxPath);

    // Nettoyer les fichiers temporaires
    fs.unlinkSync(tempMdPath);
    fs.unlinkSync(tempDocxPath);

    return docxBuffer;
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(tempMdPath)) fs.unlinkSync(tempMdPath);
    if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
    throw error;
  }
}

module.exports = { generateDocxWithHeader };
