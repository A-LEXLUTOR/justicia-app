import { useState, useEffect } from 'react';
import legalKnowledgeBase from '../data/legal-knowledge-base-ci.json';
import WebSearchService, { LegalSearchResult } from '../services/WebSearchService';

interface LegalCategory {
  id: string;
  title: string;
  description: string;
  url: string;
  keywords: string[];
}

interface LegalKnowledgeResult {
  category: LegalCategory | null;
  relevantSections: any[];
  webResults: LegalSearchResult[];
  hasLocalResults: boolean;
  hasWebResults: boolean;
}

export const useLegalKnowledge = (query: string) => {
  const [result, setResult] = useState<LegalKnowledgeResult>({
    category: null,
    relevantSections: [],
    webResults: [],
    hasLocalResults: false,
    hasWebResults: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query && query.length > 3) {
      searchLegalKnowledge();
    }
  }, [query]);

  const searchLegalKnowledge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Recherche dans la base de connaissances locale
      const localResults = searchLocalKnowledge(query);
      
      // 2. Déterminer si une recherche internet est nécessaire
      const searchService = WebSearchService.getInstance();
      const shouldSearch = searchService.shouldSearchInternet(query, localResults.relevantSections);
      
      let webResults: LegalSearchResult[] = [];
      
      // 3. Recherche internet si nécessaire
      if (shouldSearch) {
        webResults = await searchService.searchLegalContent(query);
      }
      
      setResult({
        category: localResults.category,
        relevantSections: localResults.relevantSections,
        webResults,
        hasLocalResults: localResults.relevantSections.length > 0,
        hasWebResults: webResults.length > 0
      });
    } catch (err) {
      setError('Erreur lors de la recherche juridique');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchLocalKnowledge = (query: string): { category: LegalCategory | null; relevantSections: any[] } => {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ').filter(w => w.length > 2);
    
    let bestCategory: LegalCategory | null = null;
    let bestScore = 0;
    const relevantSections: any[] = [];
    
    // Parcourir toutes les catégories
    for (const category of legalKnowledgeBase.categories) {
      let score = 0;
      
      // Vérifier les mots-clés de la catégorie
      for (const keyword of category.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }
      
      // Vérifier le titre et la description
      if (queryLower.includes(category.title.toLowerCase())) {
        score += 20;
      }
      
      for (const word of words) {
        if (category.description.toLowerCase().includes(word)) {
          score += 5;
        }
      }
      
      // Parcourir les sections pour trouver des correspondances
      for (const section of category.sections) {
        if (section.title.toLowerCase().includes(queryLower)) {
          score += 15;
          relevantSections.push({
            category: category.title,
            section: section.title,
            url: category.url,
            articles: (section as any).articles
          });
        }
        
        if (section.subsections) {
          for (const subsection of section.subsections) {
            if (subsection.title.toLowerCase().includes(queryLower)) {
              score += 10;
              relevantSections.push({
                category: category.title,
                section: section.title,
                subsection: subsection.title,
                url: category.url,
                articles: (subsection as any).articles,
                topics: subsection.topics
              });
            }
            
            // Vérifier les topics
            if (subsection.topics) {
              for (const topic of subsection.topics) {
                for (const word of words) {
                  if (topic.toLowerCase().includes(word)) {
                    score += 3;
                  }
                }
              }
            }
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as LegalCategory;
      }
    }
    
    return {
      category: bestScore > 10 ? bestCategory : null,
      relevantSections: relevantSections.slice(0, 5)
    };
  };

  const formatLocalResults = (): string => {
    if (!result.hasLocalResults) {
      return '';
    }
    
    let formatted = '📚 **Références juridiques locales :**\n\n';
    
    if (result.category) {
      formatted += `**Catégorie** : ${result.category.title}\n`;
      formatted += `${result.category.description}\n\n`;
    }
    
    if (result.relevantSections.length > 0) {
      formatted += '**Sections pertinentes :**\n\n';
      result.relevantSections.forEach((section, index) => {
        formatted += `${index + 1}. **${section.section}**\n`;
        if (section.subsection) {
          formatted += `   └─ ${section.subsection}\n`;
        }
        if (section.articles) {
          formatted += `   📖 ${section.articles}\n`;
        }
        if (section.topics) {
          formatted += `   🔖 ${section.topics.join(', ')}\n`;
        }
        formatted += `   🔗 [Consulter](${section.url})\n\n`;
      });
    }
    
    return formatted;
  };

  const getRecommendedArticles = (): string[] => {
    const articles: string[] = [];
    
    for (const section of result.relevantSections) {
      if (section.articles) {
        articles.push(section.articles);
      }
    }
    
    return articles;
  };

  const getSuggestedQuestions = (): string[] => {
    if (!result.category) {
      return [];
    }
    
    // Trouver les questions fréquentes liées à cette catégorie
    const questions = legalKnowledgeBase.commonQuestions
      .filter(q => q.category === result.category?.id)
      .map(q => q.question);
    
    return questions.slice(0, 3);
  };

  return {
    result,
    isLoading,
    error,
    formatLocalResults,
    getRecommendedArticles,
    getSuggestedQuestions
  };
};

export default useLegalKnowledge;
