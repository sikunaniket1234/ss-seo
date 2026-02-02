import natural from 'natural';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SEOPageData } from '../models/seo.models.js';

// Initialize Gemini with the provided API Key
const genAI = new GoogleGenerativeAI("AIzaSyAnSIJ4A9kT6EPxEZD7ta5C9yz1d9Ktkhs");

export class AIIntelligenceService {
    public static extractKeywords(htmlContent: string): string[] {
        const tfidf = new (natural as any).TfIdf();
        const cleanText = htmlContent
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        tfidf.addDocument(cleanText);
        const terms = (tfidf as any).listTerms(0);
        return terms
            .filter((item: any) => item.term.length > 3)
            .slice(0, 10)
            .map((item: any) => (item.term as string));
    }

    public static calculateReadability(htmlContent: string): number {
        const text = htmlContent
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
        const words = text.split(/\s+/).filter(w => w.trim().length > 0).length || 1;

        const countSyllables = (word: string) => {
            word = word.toLowerCase();
            if (word.length <= 3) return 1;
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const res = word.match(/[aeiouy]{1,2}/g);
            return res ? res.length : 1;
        };

        const syllables = text.split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0);
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    public static generateAltSuggestions(imgSrc: string, context: string): string {
        const filename = imgSrc.split('/').pop()?.split('.')[0] || 'Image';
        const cleanContext = context.length > 50 ? context.substring(0, 50) + '...' : context;
        return `${filename.replace(/[-_]/g, ' ')} showing ${cleanContext}`.trim();
    }

    public static async generateSuggestions(data: SEOPageData, keywords: string[]) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a world-class SEO expert. Analyze the following page data and generate 3 distinct meta tag strategy variations.
                
                Page Title: ${data.title}
                Page H1: ${data.h1.join(', ')}
                Keywords Found: ${keywords.join(', ')}
                
                Required Format: Return ONLY a valid JSON object with the following structure:
                {
                    "variations": [
                        {
                            "id": "benefit",
                            "strategy": "Benefit-Focused",
                            "title": "Generated Title (Max 60 chars)",
                            "description": "Generated Description (Max 160 chars)",
                            "score": 92
                        },
                        {
                            "id": "informative",
                            "strategy": "Informative/How-to",
                            "title": "Generated Title (Max 60 chars)",
                            "description": "Generated Description (Max 160 chars)",
                            "score": 88
                        },
                        {
                            "id": "authority",
                            "strategy": "Authority Build",
                            "title": "Generated Title (Max 60 chars)",
                            "description": "Generated Description (Max 160 chars)",
                            "score": 95
                        }
                    ],
                    "keywords": "comma, separated, list, of, keywords"
                }

                Rules:
                1. Strategies must be distinct.
                2. Titles MUST be under 60 characters.
                3. Descriptions MUST be under 160 characters.
                4. Use the extracted keywords naturally.
                5. The JSON must be parseable.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response (handling potential markdown blocks)
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const aiData = JSON.parse(jsonStr);

            return {
                ...aiData,
                title: aiData.variations[0].title,
                description: aiData.variations[0].description,
                imageAlts: data.images.map(img => !img.alt ? this.generateAltSuggestions(img.src || 'image.png', data.h1[0] || keywords[0] || 'site content') : img.alt)
            };

        } catch (error) {
            console.error("Gemini AI failed, falling back to local patterns:", error);
            return this.generateSuggestionsLocal(data, keywords);
        }
    }

    // Fallback method in case API fails
    private static generateSuggestionsLocal(data: SEOPageData, keywords: string[]) {
        const brandName = "Agency SEO Engine";
        const h1Main = data.h1[0] || "";
        const kSafe = keywords || [];
        const keywordMain = kSafe[0] || "Our Site";

        const verbs = ['Maximize', 'Elevate', 'Optimize', 'Boost', 'Unleash', 'Master'];
        const adjectives = ['Expert', 'Proven', 'Strategic', 'Data-Driven', 'Premium', 'Pro'];
        const getRandom = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] || arr[0] || "";

        const var1 = {
            id: 'benefit', strategy: 'Benefit-Focused',
            title: `${getRandom(verbs)} ${h1Main || keywordMain} | ${getRandom(adjectives)} Results`.slice(0, 60),
            description: `${getRandom(verbs)} the full potential of your site content and get professional solutions.`.slice(0, 160),
            score: 92
        };

        const var2 = {
            id: 'informative', strategy: 'Informative/How-to',
            title: `How to ${getRandom(verbs)} ${h1Main || keywordMain} for Success`.slice(0, 60),
            description: `Discover the ultimate guide to ${h1Main || keywordMain}. Best practices and latest trends.`.slice(0, 160),
            score: 88
        };

        const var3 = {
            id: 'authority', strategy: 'Authority Build',
            title: `#1 Source for ${h1Main || keywordMain} - ${brandName}`.slice(0, 60),
            description: `Join the leaders in ${h1Main || keywordMain}. Elite strategies and results.`.slice(0, 160),
            score: 95
        };

        return {
            variations: [var3, var1, var2],
            title: var3.title,
            description: var3.description,
            keywords: kSafe.join(', '),
            imageAlts: data.images.map(img => !img.alt ? this.generateAltSuggestions(img.src || 'image.png', h1Main || keywordMain) : img.alt)
        };
    }

    public static async generateRoadmap(data: SEOPageData, currentRank: number, keyword: string) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a senior SEO Strategist. Create a 30-60-90 day roadmap to rank a website to the #1 position on Google.
                
                Target Keyword: ${keyword}
                Current Position: ${currentRank}
                Page Title: ${data.title}
                Page H1: ${data.h1.join(', ')}
                
                Required Format: Return ONLY a valid JSON object with this structure:
                {
                    "estimatedTimeframe": "3-6 months",
                    "milestones": [
                        { "phase": "Immediate (1-7 Days)", "tasks": ["Task 1", "Task 2"], "impact": "High" },
                        { "phase": "Short Term (30 Days)", "tasks": ["Task 3", "Task 4"], "impact": "Medium" },
                        { "phase": "Growth (60-90 Days)", "tasks": ["Task 5", "Task 6"], "impact": "Very High" }
                    ],
                    "strategicAdvice": "Direct advice for the user"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Roadmap generation failed:", error);
            return {
                estimatedTimeframe: "6-12 months",
                milestones: [
                    { phase: "Phase 1", tasks: ["Optimize On-page Meta Tags", "Fix Technical Errors"], impact: "High" },
                    { phase: "Phase 2", tasks: ["Build Quality Backlinks", "Content Expansion"], impact: "Very High" }
                ],
                strategicAdvice: "Consistency is key. Focus on technical health first."
            };
        }
    }

    public static evaluateMeta(customTitle: string, customDesc: string, currentData: SEOPageData) {
        let score = 0;
        const feedback: string[] = [];

        const getVisualWeight = (str: string) => {
            const caps = (str.match(/[A-Z]/g) || []).length;
            const symbols = (str.match(/[WM]/g) || []).length;
            return str.length + (caps * 0.2) + (symbols * 0.3);
        };

        const titleWeight = getVisualWeight(customTitle);
        if (titleWeight >= 35 && titleWeight <= 58) {
            score += 40;
            feedback.push('Title visual width is perfect for Google SERPs.');
        } else if (titleWeight > 58) {
            feedback.push('Title may be truncated in search results (too wide).');
        } else {
            feedback.push('Title is visually thin; add a benefit or brand name.');
        }

        if (customDesc.length >= 120 && customDesc.length <= 156) {
            score += 30;
            feedback.push('Description length is ideal for high click-through rate.');
        } else {
            feedback.push(customDesc.length < 120 ? 'Description is too short to be persuasive.' : 'Description exceeds 156 chars and will be cut off.');
        }

        const h1Arr = currentData.h1 || [];
        const h1Text = h1Arr[0] || "";
        const h1Lower = h1Text.toLowerCase();
        const importantWords = h1Lower.split(' ').filter(w => w.length > 4);
        const matchedInMeta = importantWords.filter(w => customTitle.toLowerCase().includes(w) || customDesc.toLowerCase().includes(w));

        if (matchedInMeta.length >= Math.min(1, importantWords.length)) {
            score += 30;
            feedback.push('Strong semantic link between H1 and Meta content.');
        } else if (importantWords.length > 0) {
            feedback.push(`Include terms from your H1: "${importantWords.slice(0, 3).join(', ')}".`);
        }

        return {
            score: Math.min(100, score),
            feedback,
            isWorthDoing: score >= 70
        };
    }

    public static async generateSocialTags(data: SEOPageData) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a Social Media Optimization Expert. Generate Open Graph and Twitter Card tags for this page.
                
                Page Title: ${data.title}
                Page Description: ${data.description}
                H1 Tag: ${data.h1[0] || 'No H1'}
                
                Required Format: Return ONLY a valid JSON object with this structure:
                {
                    "ogTitle": "Catchy Social Title",
                    "ogDescription": "Engaging social description for sharing",
                    "ogType": "website",
                    "twitterCard": "summary_large_image",
                    "twitterTitle": "Optimized Twitter Title",
                    "twitterDescription": "Short, punchy twitter description",
                    "suggestedImage": "Description of what the social image should look like"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Social tags generation failed:", error);
            return {
                ogTitle: data.title,
                ogDescription: data.description,
                ogType: "website",
                twitterCard: "summary_large_image",
                twitterTitle: data.title,
                twitterDescription: data.description,
                suggestedImage: "A clean, professional representation of the brand."
            };
        }
    }
}
