import natural from 'natural';
import type { SEOPageData } from '../models/seo.models.js';

export class AIIntelligenceService {
    public static extractKeywords(htmlContent: string): string[] {
        const tfidf = new (natural as any).TfIdf();
        // Remove tags and extra whitespace to get clean text for analysis
        const cleanText = htmlContent
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        tfidf.addDocument(cleanText);

        const terms = (tfidf as any).listTerms(0);
        // Filter out common stop words or very short terms manually if needed, 
        // though TfIdf helps with relevance.
        return terms
            .filter((item: any) => item.term.length > 3)
            .slice(0, 10)
            .map((item: any) => item.term);
    }

    public static calculateReadability(htmlContent: string): number {
        const text = htmlContent
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
        const words = text.split(/\s+/).filter(w => w.trim().length > 0).length || 1;

        // Simple syllable counter heuristic
        const countSyllables = (word: string) => {
            word = word.toLowerCase();
            if (word.length <= 3) return 1;
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const res = word.match(/[aeiouy]{1,2}/g);
            return res ? res.length : 1;
        };

        const syllables = text.split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0);

        // Flesch Reading Ease Formula
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    public static generateAltSuggestions(imgSrc: string, context: string): string {
        // Extract filename without extension as fallback
        const filename = imgSrc.split('/').pop()?.split('.')[0] || 'Image';
        const cleanContext = context.length > 50 ? context.substring(0, 50) + '...' : context;

        return `${filename.replace(/[-_]/g, ' ')} showing ${cleanContext}`.trim();
    }

    public static generateSuggestions(data: SEOPageData, keywords: string[]) {
        const suggestions = {
            title: data.title,
            description: data.description,
            keywords: keywords.join(', '),
            imageAlts: data.images.map(img => !img.alt ? this.generateAltSuggestions(img.src, data.h1[0] || 'Site Content') : img.alt)
        };

        // Heuristic: If title is weak, use H1 + Brand
        if (!data.title || data.title.length < 20) {
            const base = data.h1.length > 0 ? data.h1[0] : (keywords[0] || 'My Site');
            suggestions.title = `${base} | Professional SEO Insight`.slice(0, 60);
        }

        // Heuristic: If description is missing, synthesize from H1/H2 and keywords
        if (!data.description || data.description.length < 50) {
            const topic = data.h1.length > 0 ? data.h1[0] : keywords.slice(0, 2).join(' and ');
            suggestions.description = `Discover comprehensive details about ${topic}. Featuring insights on ${keywords.slice(2, 5).join(', ')}. Optimize your static site effectively.`.slice(0, 160);
        }

        return suggestions;
    }
}
