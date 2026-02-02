import path from 'path';
import fs from 'fs-extra';
import { SEOAnalyzer } from '../engine/seo-analyzer.js';
import type { SEOAuditReport, SiteReport } from '../models/seo.models.js';

export class CrawlerService {
    public static async analyzeSite(localPath: string, siteId: string, baseUrl: string = ''): Promise<SiteReport> {
        const htmlFiles = await this.findHtmlFiles(localPath);
        const reports: SEOAuditReport[] = [];

        for (const file of htmlFiles) {
            const html = await fs.readFile(file, 'utf8');
            const relativePath = path.relative(localPath, file);
            const report = await SEOAnalyzer.analyze(html, baseUrl ? `${baseUrl}/${relativePath}` : relativePath);
            report.filePath = file;
            reports.push(report);
        }

        const overallScore = reports.length > 0
            ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
            : 0;

        return {
            siteId,
            timestamp: new Date().toISOString(),
            overallScore,
            pages: reports
        };
    }

    private static async findHtmlFiles(dir: string): Promise<string[]> {
        let results: string[] = [];
        const list = await fs.readdir(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);

            if (stat && stat.isDirectory()) {
                if (file !== 'node_modules' && !file.startsWith('.')) {
                    results = results.concat(await this.findHtmlFiles(filePath));
                }
            } else if (filePath.endsWith('.html')) {
                results.push(filePath);
            }
        }
        return results;
    }

    public static async generateSitemap(localPath: string, baseUrl: string): Promise<string> {
        const files = await this.findHtmlFiles(localPath);
        const urls = files.map(f => {
            const rel = path.relative(localPath, f).replace(/\\/g, '/');
            return `  <url>\n    <loc>${baseUrl}/${rel}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>`;
        });

        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    }

    public static generateRobotsTxt(baseUrl: string): string {
        return `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
    }
}
