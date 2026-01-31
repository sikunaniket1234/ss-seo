export interface SEOPageData {
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    robots: string;
    ogTitle: string;
    ogDescription: string;
    viewport?: string;
    h1: string[];
    h2: string[];
    images: Array<{ src: string; alt: string | null; loading?: string }>;
    links: Array<{ href: string; text: string }>;
    lang: string;
}

export interface SEOScores {
    meta: number;
    structure: number;
    accessibility: number;
    technical: number;
    bestPractices: number;
}

export interface SEOAuditReport {
    url: string;
    filePath?: string;
    timestamp: string;
    data: SEOPageData;
    scores: SEOScores;
    overallScore: number;
    recommendations: string[];
    readabilityScore?: number;
    brokenLinks?: string[];
    suggestedTags?: {
        title: string;
        description: string;
        keywords: string;
    };
}

export interface SiteReport {
    siteId: string;
    timestamp: string;
    overallScore: number;
    pages: SEOAuditReport[];
}

export interface Site {
    id: string;
    name: string;
    url?: string;
    localPath?: string;
    lastAnalysis?: string;
    status: 'active' | 'archived';
    averageScore?: number;
    previousScore?: number;
    history?: Array<{ timestamp: string; score: number }>;
    report?: SiteReport;
}
