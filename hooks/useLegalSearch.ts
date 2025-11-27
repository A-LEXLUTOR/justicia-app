import { useState, useCallback } from 'react';
import legalKnowledgeBase from '../data/legal-knowledge-base.json';

interface LegalCategory {
  id: string;
  number: string;
  title: string;
  url: string;
  keywords: string[];
  description: string;
}

interface SearchResult {
  category?: LegalCategory;
  suggestion: string;
  shouldSearchWeb: boolean;
  relevantKeywords: string[];
}

export const useLegalSearch = () => {
  const [isSearching, setIsSearching] = useState(false);

  const searchLegalKnowledge = useCallback((query: string): SearchResult => {
    const lowerQuery = query.toLowerCase();
    
    // Vérifier les requêtes communes prédéfinies
    const commonQueries = legalKnowledgeBase.commonQueries as Record<string, any>;
    for (const [key, value] of Object.entries(commonQueries)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        const category = legalKnowledgeBase.categories.find(
          cat => cat.id === value.category
        );
        return {
          category: category as LegalCategory | undefined,
          suggestion: value.suggestion,
          shouldSearchWeb: true,
          relevantKeywords: [key]
        };
      }
    }

    // Rechercher dans les catégories par mots-clés
    const matchedCategories = legalKnowledgeBase.categories.filter(category => {
      return category.keywords.some(keyword => 
        lowerQuery.includes(keyword.toLowerCase())
      );
    });

    if (matchedCategories.length > 0) {
      const bestMatch = matchedCategories[0];
      return {
        category: bestMatch as LegalCategory,
        suggestion: `Cette question concerne "${bestMatch.title}". Consultez ${bestMatch.url} pour plus de détails.`,
        shouldSearchWeb: true,
        relevantKeywords: bestMatch.keywords.filter(kw => 
          lowerQuery.includes(kw.toLowerCase())
        )
      };
    }

    // Aucune correspondance trouvée - suggérer une recherche web
    return {
      suggestion: "Je n'ai pas trouvé cette information dans ma base de connaissances. Je vais effectuer une recherche internet pour vous aider.",
      shouldSearchWeb: true,
      relevantKeywords: []
    };
  }, []);

  const detectLegalQuery = useCallback((message: string): boolean => {
    const legalIndicators = [
      'article', 'loi', 'décret', 'code', 'ccag', 'ohada',
      'juridique', 'légal', 'droit', 'texte', 'réglementation',
      'contrat', 'société', 'commercial', 'procédure'
    ];

    const lowerMessage = message.toLowerCase();
    return legalIndicators.some(indicator => lowerMessage.includes(indicator));
  }, []);

  return {
    searchLegalKnowledge,
    detectLegalQuery,
    isSearching,
    setIsSearching
  };
};
