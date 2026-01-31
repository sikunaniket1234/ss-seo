import * as cheerio from 'cheerio';
import type { SEOAuditReport, SEOPageData } from '../models/seo.models.js';
import { AIIntelligenceService } from '../services/ai-intel.service.js';

export class SEOAnalyzer {
    public static analyze(html: string, url: string = ''): SEOAuditReport {
        const $ = cheerio.load(html);
        const data: SEOPageData = this.extractData($);
        const scores = this.calculateScores(data, url);

        return {
            url,
            timestamp: new Date().toISOString(),
            data,
            scores,
            overallScore: Math.round(
                (scores.meta * 0.25) +
                (scores.structure * 0.20) +
                (scores.accessibility * 0.20) +
                (scores.technical * 0.20) +
                (scores.bestPractices * 0.15)
            ),
            recommendations: this.generateRecommendations(data, scores, url),
            readabilityScore: AIIntelligenceService.calculateReadability(html),
            brokenLinks: this.detectBrokenLinks(data.links),
            suggestedTags: AIIntelligenceService.generateSuggestions(data, AIIntelligenceService.extractKeywords(html))
        };
    }

    private static detectBrokenLinks(links: Array<{ href: string; text: string }>): string[] {
        // Simple heuristic: links starting with # or javascript: are not broken per se
        // Empty links or absolute links that look like placeholder patterns
        return links
            .filter(l => !l.href || l.href === '#' || l.href.includes('example.com'))
            .map(l => l.href || 'Empty Link');
    }

    private static extractData($: cheerio.CheerioAPI): SEOPageData {
        return {
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content') || '',
            keywords: $('meta[name="keywords"]').attr('content') || '',
            canonical: $('link[rel="canonical"]').attr('href') || '',
            robots: $('meta[name="robots"]').attr('content') || '',
            ogTitle: $('meta[property="og:title"]').attr('content') || '',
            ogDescription: $('meta[property="og:description"]').attr('content') || '',
            viewport: $('meta[name="viewport"]').attr('content') || '',
            h1: $('h1').map((_, el) => $(el).text().trim()).get(),
            h2: $('h2').map((_, el) => $(el).text().trim()).get(),
            images: $('img').map((_, el) => ({
                src: $(el).attr('src') || '',
                alt: $(el).attr('alt') || null,
                loading: $(el).attr('loading') || ''
            })).get(),
            links: $('a').map((_, el) => ({
                href: $(el).attr('href') || '',
                text: $(el).text().trim()
            })).get(),
            lang: $('html').attr('lang') || ''
        };
    }

    private static calculateScores(data: SEOPageData, url: string) {
        let meta = 0;
        let structure = 0;
        let accessibility = 0;
        let technical = 0;
        let bestPractices = 0;

        // Meta Score (0-100)
        if (data.title) meta += 30;
        if (data.title.length >= 30 && data.title.length <= 60) meta += 20;
        if (data.description) meta += 30;
        if (data.description.length >= 120 && data.description.length <= 160) meta += 20;

        // Structure Score (0-100)
        if (data.h1.length === 1) structure += 50;
        else if (data.h1.length > 1) structure += 20;
        if (data.h2.length > 0) structure += 30;
        if (data.h1.length > 0 && data.h2.length > 0) structure += 20;

        // Accessibility (0-100)
        const imagesCount = data.images.length;
        const imagesWithAlt = data.images.filter(img => img.alt !== null && img.alt !== '').length;
        accessibility += imagesCount > 0 ? (imagesWithAlt / imagesCount) * 80 : 80;

        // Check for lazy loading on images (modern best practice)
        const lazyImages = data.images.filter(img => img.loading === 'lazy').length;
        if (imagesCount > 0 && lazyImages > 0) accessibility += 20;
        else if (imagesCount === 0) accessibility += 20;

        // Technical (0-100)
        if (data.canonical) technical += 30;
        if (data.lang) technical += 20;
        if (data.viewport) technical += 30;
        if (url.startsWith('https://')) technical += 20;

        // Best Practices (0-100)
        if (data.ogTitle) bestPractices += 25;
        if (data.ogDescription) bestPractices += 25;
        // Check for internal vs external links
        const internalLinks = data.links.filter(l => l.href.startsWith('/') || l.href.includes(url)).length;
        if (internalLinks > 0) bestPractices += 25;
        if (data.links.length > 5) bestPractices += 25;

        return {
            meta: Math.min(100, meta),
            structure: Math.min(100, structure),
            accessibility: Math.min(100, accessibility),
            technical: Math.min(100, technical),
            bestPractices: Math.min(100, bestPractices)
        };
    }

    private static generateRecommendations(data: SEOPageData, scores: any, url: string): string[] {
        const recs: string[] = [];

        // Meta suggestions
        if (!data.title) recs.push('Add a <title> tag to your page. It is critical for search rankings.');
        else if (data.title.length < 30) recs.push('Title is too short (under 30 chars). Expand it to include relevant keywords.');

        if (!data.description) recs.push('Add a meta description to summarize page content for users in search results.');

        // Structure suggestions
        if (data.h1.length === 0) recs.push('No H1 tag found. Each page should have one main heading.');
        else if (data.h1.length > 1) recs.push('Multiple H1 tags found. Stick to one H1 per page for better hierarchy.');

        // Accessibility
        const missingAlts = data.images.filter(img => !img.alt).length;
        if (missingAlts > 0) recs.push(`${missingAlts} images are missing alt attributes (ADA compliance).`);

        // Technical
        if (!data.viewport) recs.push('Missing viewport meta tag. This is required for mobile-friendliness.');
        if (!data.canonical) recs.push('Add a canonical link tag to prevent duplicate content indexing.');
        if (url && !url.startsWith('https://')) recs.push('Your site is not using HTTPS. Security is a ranking factor.');

        // Best Practices
        if (!data.ogTitle || !data.ogDescription) recs.push('Add Open Graph tags (og:title/og:description) for better social sharing preview.');

        return recs;
    }
}
