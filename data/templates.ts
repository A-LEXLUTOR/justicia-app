/**
 * Base de données des modèles de documents juridiques
 */

export interface TemplateField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'number' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export interface DocumentTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    filename: string;
    fields: TemplateField[];
    aiPrompt: string;
}

// Catégories de modèles
export const TEMPLATE_CATEGORIES = [
    'Courriers et Mises en Demeure',
    'Réceptions et Livraisons',
    'Contrats et Conventions',
    'Gestion de Chantier'
];

// Liste des modèles disponibles (version allégée)
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    {
        id: 'journal-chantier',
        title: 'Journal de Chantier',
        description: 'Suivi quotidien des activités sur le chantier',
        category: 'Gestion de Chantier',
        filename: 'MODELEJOURNALDECHANTIER.xlsx',
        fields: [
            { name: 'projet', label: 'Nom du Projet', type: 'text', required: true, placeholder: 'Ex: Construction Pont' },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'travaux', label: 'Travaux Réalisés', type: 'textarea', required: true, placeholder: 'Décrire les travaux...' }
        ],
        aiPrompt: 'Générer un journal de chantier pour {projet} en date du {date}. Travaux: {travaux}'
    },
    {
        id: 'mise-demeure-hse',
        title: 'Mise en Demeure HSE',
        description: 'Courrier pour non-respect des consignes de sécurité',
        category: 'Courriers et Mises en Demeure',
        filename: 'PORTEOBTPCI-MISEENDEMEUREHSE.docx',
        fields: [
            { name: 'entreprise', label: 'Entreprise', type: 'text', required: true, placeholder: 'Ex: BATIMEX' },
            { name: 'probleme', label: 'Problème HSE', type: 'textarea', required: true, placeholder: 'Décrire le problème...' }
        ],
        aiPrompt: 'Rédiger une mise en demeure HSE pour {entreprise}. Problème: {probleme}'
    },
    {
        id: 'reception-provisoire',
        title: 'Demande de Réception Provisoire',
        description: 'Courrier de demande de réception provisoire',
        category: 'Réceptions et Livraisons',
        filename: 'PORTOBTP-RECEPTION-PROVISOIRE.docx',
        fields: [
            { name: 'projet', label: 'Projet', type: 'text', required: true, placeholder: 'Ex: Immeuble Les Palmiers' },
            { name: 'date_achevement', label: 'Date Achèvement', type: 'date', required: true }
        ],
        aiPrompt: 'Rédiger une demande de réception provisoire pour {projet}, achevé le {date_achevement}'
    },
    {
        id: 'contrat-transport',
        title: 'Contrat de Transport',
        description: 'Contrat de transport de matériaux',
        category: 'Contrats et Conventions',
        filename: 'CONTRATTRANSPORT.docx',
        fields: [
            { name: 'transporteur', label: 'Transporteur', type: 'text', required: true, placeholder: 'Ex: TRANS-CI' },
            { name: 'materiaux', label: 'Matériaux', type: 'text', required: true, placeholder: 'Ex: Sable, gravier' }
        ],
        aiPrompt: 'Rédiger un contrat de transport avec {transporteur} pour {materiaux}'
    },
    {
        id: 'location-engins',
        title: 'Contrat de Location d\'Engins',
        description: 'Contrat de location d\'engins de chantier',
        category: 'Contrats et Conventions',
        filename: 'CONTRATLOCATIONEN GINS.docx',
        fields: [
            { name: 'locataire', label: 'Locataire', type: 'text', required: true, placeholder: 'Ex: ENTREPRISE BTP' },
            { name: 'engin', label: 'Type Engin', type: 'select', required: true, options: ['Pelle mécanique', 'Bulldozer', 'Grue'] }
        ],
        aiPrompt: 'Rédiger un contrat de location d\'engin ({engin}) pour {locataire}'
    }
];
