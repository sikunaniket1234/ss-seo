import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { SEOAnalyzer } from './engine/seo-analyzer.js';
import { MetaPatcher } from './engine/meta-patcher.js';
import type { Site } from './models/seo.models.js';
import { SnapshotService } from './services/snapshot.service.js';
import { AutomatorService } from './services/automator.service.js';
import { CrawlerService } from './services/crawler.service.js';
import { AIIntelligenceService } from './services/ai-intel.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Database setup
const defaultData: { sites: Site[] } = { sites: [] };

console.log('Starting server initialization...');
async function startServer() {
    console.log('Database setup starting...');
    // Database setup
    const db = await JSONFilePreset('db.json', defaultData);
    console.log('Database initialized.');

    // Initialize Automation
    AutomatorService.init(db);
    console.log('Automation initialized.');

    // Routes
    app.get('/api/sites', (req, res) => {
        res.json(db.data.sites);
    });

    app.post('/api/sites', async (req, res) => {
        const { name, url, localPath } = req.body;
        const newSite: Site = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            url,
            localPath,
            status: 'active',
        };
        db.data.sites.push(newSite);
        await db.write();
        res.status(201).json(newSite);
    });

    app.post('/api/sites/:id/analyze', async (req, res) => {
        const site = db.data.sites.find(s => s.id === req.params.id);
        if (!site) return res.status(404).send('Site not found');
        if (!site.localPath) return res.status(400).send('Local path missing');

        try {
            const siteReport = await CrawlerService.analyzeSite(site.localPath, site.id, site.url);

            // Record history
            site.previousScore = site.averageScore || 0;
            if (!site.history) site.history = [];

            site.history.push({
                timestamp: site.lastAnalysis || new Date().toISOString(),
                score: site.averageScore || 0
            });

            // Keep only last 10 entries
            if (site.history.length > 10) site.history.shift();

            site.report = siteReport;
            site.averageScore = siteReport.overallScore;
            site.lastAnalysis = new Date().toISOString();

            await db.write();
            res.json(siteReport);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/sites/:id/generate-technical', async (req, res) => {
        const site = db.data.sites.find(s => s.id === req.params.id);
        if (!site) return res.status(404).send('Site not found');

        const baseUrl = req.body.baseUrl || site.url;
        if (!site.localPath) return res.status(400).send('Local path missing for this site');
        if (!baseUrl) return res.status(400).send('Base URL is required for generating sitemaps and robots.txt. Please provide it in site settings or request body.');

        try {
            const sitemap = await CrawlerService.generateSitemap(site.localPath, baseUrl);
            const robots = CrawlerService.generateRobotsTxt(baseUrl);

            await fs.writeFile(path.join(site.localPath, 'sitemap.xml'), sitemap);
            await fs.writeFile(path.join(site.localPath, 'robots.txt'), robots);

            res.json({ success: true, message: 'sitemap.xml and robots.txt generated.' });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/sites/:id/patch', async (req, res) => {
        const site = db.data.sites.find(s => s.id === req.params.id);
        if (!site) return res.status(404).send('Site not found');
        if (!site.localPath) return res.status(400).send('Local path missing for this site');

        try {
            const { patch } = req.body;
            const indexPath = path.join(site.localPath, 'index.html');

            // 1. Create safety snapshot
            await SnapshotService.createSnapshot(site.id, indexPath);

            // 2. Apply the patch
            await MetaPatcher.applyPatch(indexPath, patch);

            res.json({ success: true, message: 'Patch applied and snapshot created.' });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/sites/:id/evaluate', async (req, res) => {
        const site = db.data.sites.find(s => s.id === req.params.id);
        if (!site) return res.status(404).send('Site not found');

        const { title, description, pageIndex } = req.body;
        const pageReport = site.report?.pages[pageIndex || 0];

        if (!pageReport) return res.status(400).send('Page report not found. Run analysis first.');

        const evaluation = AIIntelligenceService.evaluateMeta(title, description, pageReport.data);
        res.json(evaluation);
    });

    app.post('/api/sites/:id/refresh-suggestions', async (req, res) => {
        const site = db.data.sites.find(s => s.id === req.params.id);
        if (!site) return res.status(404).send('Site not found');

        const { pageIndex } = req.body;
        const pageReport = site.report?.pages[pageIndex || 0];

        if (!pageReport) return res.status(400).send('Page report not found.');

        const keywords = AIIntelligenceService.extractKeywords(pageReport.data.title + ' ' + (pageReport.data.h1[0] || ''));
        pageReport.suggestedTags = await AIIntelligenceService.generateSuggestions(pageReport.data, keywords);

        await db.write();
        res.json(pageReport.suggestedTags);
    });

    app.listen(PORT, () => {
        console.log(`SS-SEO Backend listening on port ${PORT}`);
    });
}

startServer().catch(console.error);
