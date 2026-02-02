import cron from 'node-cron';
import axios from 'axios';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs-extra';
import { SEOAnalyzer } from '../engine/seo-analyzer.js';
import { CrawlerService } from './crawler.service.js';
import type { Site } from '../models/seo.models.js';

export class AutomatorService {
    public static init(db: any) {
        // Run every day at midnight (0 0 * * *)
        // Setting to every minute for testing if needed, but keeping 24h as requested
        cron.schedule('0 0 * * *', async () => {
            console.log('Running scheduled 24-hour SEO analysis...');
            const sites: Site[] = db.data.sites;

            for (const site of sites) {
                if (site.status !== 'active') continue;

                try {
                    // 1. Local Audit (if path exists)
                    if (site.localPath) {
                        const siteReport = await CrawlerService.analyzeSite(site.localPath, site.id, site.url);
                        site.report = siteReport;
                        site.averageScore = siteReport.overallScore;
                    }

                    // 2. Remote URL Audit (User requested "check periodically from url")
                    if (site.url) {
                        try {
                            const response = await axios.get(site.url, { timeout: 10000 });
                            const liveReport = await SEOAnalyzer.analyze(response.data, site.url);

                            // If we only have URL and no local path, use this as main report
                            if (!site.localPath) {
                                site.averageScore = liveReport.overallScore;
                                site.report = {
                                    siteId: site.id,
                                    timestamp: new Date().toISOString(),
                                    overallScore: liveReport.overallScore,
                                    pages: [liveReport]
                                };
                            }
                        } catch (urlErr) {
                            console.error(`Remote audit failed for ${site.url}:`, urlErr);
                        }
                    }

                    // Update History for Dashboard charts
                    if (!site.history) site.history = [];
                    site.history.push({
                        timestamp: new Date().toISOString(),
                        score: site.averageScore || 0
                    });

                    // Keep last 30 days of history
                    if (site.history.length > 30) site.history.shift();

                    site.lastAnalysis = new Date().toISOString();
                    console.log(`[Scheduled] Analyzed ${site.name}: ${site.averageScore}%`);
                } catch (err) {
                    console.error(`Failed to analyze ${site.name}:`, err);
                }
            }
            await db.write();
        });
    }
}
