import cron from 'node-cron';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs-extra';
import { SEOAnalyzer } from '../engine/seo-analyzer.js';
import { CrawlerService } from './crawler.service.js';
import type { Site } from '../models/seo.models.js';

export class AutomatorService {
    public static init(db: any) {
        // Run every day at midnight
        cron.schedule('0 0 * * *', async () => {
            console.log('Running scheduled SEO analysis...');
            const sites: Site[] = db.data.sites;

            for (const site of sites) {
                if (site.status === 'active' && site.localPath) {
                    try {
                        const siteReport = await CrawlerService.analyzeSite(site.localPath, site.id, site.url);

                        site.report = siteReport;
                        site.averageScore = siteReport.overallScore;
                        site.lastAnalysis = new Date().toISOString();

                        console.log(`Analyzed Site ${site.name}: ${siteReport.overallScore}% (${siteReport.pages.length} pages)`);
                    } catch (err) {
                        console.error(`Failed to analyze ${site.name}:`, err);
                    }
                }
            }
            await db.write();
        });
    }
}
