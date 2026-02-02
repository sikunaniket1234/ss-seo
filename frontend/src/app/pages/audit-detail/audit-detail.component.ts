import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SEOAuditReport, SiteReport, Site } from '../../models/seo.models';

@Component({
    selector: 'app-audit-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './audit-detail.component.html',
    styleUrls: ['./audit-detail.component.scss']
})
export class AuditDetailComponent implements OnInit {
    site = signal<Site | null>(null);
    siteReport = signal<SiteReport | null>(null);
    selectedPageIndex = signal(0);
    loading = signal(false);
    patching = signal(false);
    generatingTechnical = signal(false);
    evaluating = signal(false);
    refreshingAI = signal(false);
    selectedVariationIndex = signal(0);
    serpMode = signal<'desktop' | 'mobile'>('desktop');

    // Manual Evaluation
    manualTitle = signal('');
    manualDescription = signal('');
    evaluationResult = signal<any>(null);

    // Rank Checker
    checkingRank = signal(false);
    rankKeyword = signal('');
    rankResult = signal<any>(null);
    editingUrl = signal(false);
    newUrl = signal('');

    // Roadmap
    generatingRoadmap = signal(false);
    roadmap = signal<any>(null);

    // OG Tag Master
    generatingSocial = signal(false);
    socialTags = signal<any>(null);
    socialPreviewMode = signal<'facebook' | 'twitter'>('facebook');

    siteId = '';

    constructor(
        private route: ActivatedRoute,
        private api: ApiService
    ) { }

    ngOnInit() {
        this.siteId = this.route.snapshot.paramMap.get('id') || '';
        if (this.siteId) {
            this.loadSite();
            this.runAudit();
        }
    }

    loadSite() {
        this.api.getSites().subscribe(sites => {
            const current = sites.find(s => s.id === this.siteId);
            if (current) this.site.set(current);
        });
    }

    runAudit() {
        this.loading.set(true);
        this.api.analyzeSite(this.siteId).subscribe({
            next: (data) => {
                this.siteReport.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
            }
        });
    }

    getCurrentReport(): SEOAuditReport | null {
        const sr = this.siteReport();
        if (!sr || !sr.pages || sr.pages.length === 0) return null;
        return sr.pages[this.selectedPageIndex()] || sr.pages[0] || null;
    }

    applyPatch() {
        const report = this.getCurrentReport();
        if (!report || !report.suggestedTags) return;

        const variation = report.suggestedTags.variations ? report.suggestedTags.variations[this.selectedVariationIndex()] : null;
        const tags = variation ? { title: variation.title, description: variation.description } : report.suggestedTags;

        this.patching.set(true);
        this.api.patchSite(this.siteId, tags).subscribe({
            next: (res) => {
                alert('Success! Best SEO variation applied to your site.');
                this.patching.set(false);
                this.runAudit();
            },
            error: (err) => {
                alert('Failed to apply patch.');
                this.patching.set(false);
            }
        });
    }

    generateTechnical() {
        const currentSite = this.site();
        let baseUrl = currentSite?.url;

        if (!baseUrl) {
            baseUrl = prompt('Base URL is missing for this site. Please enter it (e.g., https://example.com):') || '';
            if (!baseUrl) return;
        }

        this.generatingTechnical.set(true);
        this.api.generateTechnicalFiles(this.siteId, baseUrl).subscribe({
            next: (res) => {
                alert('Sitemap.xml and Robots.txt generated locally!');
                this.generatingTechnical.set(false);
            },
            error: (err) => {
                const msg = err.error?.message || err.error || 'Failed to generate technical files.';
                alert(msg);
                this.generatingTechnical.set(false);
            }
        });
    }

    refreshSuggestions() {
        this.refreshingAI.set(true);
        this.api.refreshSuggestions(this.siteId, this.selectedPageIndex()).subscribe({
            next: (newTags) => {
                const sr = this.siteReport();
                if (sr && sr.pages[this.selectedPageIndex()]) {
                    sr.pages[this.selectedPageIndex()].suggestedTags = newTags;
                    this.siteReport.set({ ...sr });
                    this.selectedVariationIndex.set(0);
                }
                this.refreshingAI.set(false);
            },
            error: (err) => {
                alert('Failed to refresh suggestions.');
                this.refreshingAI.set(false);
            }
        });
    }

    evaluateManualTags() {
        if (!this.manualTitle() || !this.manualDescription()) {
            alert('Please enter both title and description.');
            return;
        }

        this.evaluating.set(true);
        this.api.evaluateTags(this.siteId, this.manualTitle(), this.manualDescription(), this.selectedPageIndex()).subscribe({
            next: (res) => {
                this.evaluationResult.set(res);
                this.evaluating.set(false);
            },
            error: (err) => {
                alert('Evaluation failed.');
                this.evaluating.set(false);
            }
        });
    }

    checkRank() {
        if (!this.rankKeyword()) return;
        this.checkingRank.set(true);
        this.api.checkRank(this.siteId, this.rankKeyword()).subscribe({
            next: (res) => {
                this.rankResult.set(res);
                this.checkingRank.set(false);
            },
            error: (err) => {
                alert(err.error || 'Rank check failed.');
                this.checkingRank.set(false);
            }
        });
    }

    updateUrl() {
        if (!this.newUrl()) return;
        this.api.updateSite(this.siteId, { url: this.newUrl() }).subscribe({
            next: (updatedSite) => {
                this.site.set(updatedSite);
                this.editingUrl.set(false);
            },
            error: (err) => alert('Failed to update URL.')
        });
    }

    generateRoadmap() {
        const rank = this.rankResult()?.position || 100;
        const keyword = this.rankKeyword();
        if (!keyword) return;

        this.generatingRoadmap.set(true);
        this.api.getRoadmap(this.siteId, keyword, rank, this.selectedPageIndex()).subscribe({
            next: (res) => {
                this.roadmap.set(res);
                this.generatingRoadmap.set(false);
            },
            error: (err) => {
                alert('Failed to generate roadmap.');
                this.generatingRoadmap.set(false);
            }
        });
    }

    getScoreClass(score: number): string {
        if (score >= 80) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }

    exportReport() {
        const report = this.getCurrentReport();
        if (!report) return;
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seo-report-${this.siteId}-${this.selectedPageIndex()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    printReport() {
        window.print();
    }

    generateSocialTags() {
        this.generatingSocial.set(true);
        this.api.getSocialTags(this.siteId, this.selectedPageIndex()).subscribe({
            next: (res) => {
                this.socialTags.set(res);
                this.generatingSocial.set(false);
            },
            error: () => {
                this.generatingSocial.set(false);
                alert('Social tags generation failed.');
            }
        });
    }

    applySocialTags() {
        const tags = this.socialTags();
        if (!tags) return;

        const patch = {
            ogTitle: tags.ogTitle,
            ogDescription: tags.ogDescription,
            twitterTitle: tags.twitterTitle,
            twitterDescription: tags.twitterDescription,
            twitterCard: tags.twitterCard
        };

        this.patching.set(true);
        this.api.patchSite(this.siteId, patch).subscribe({
            next: () => {
                alert('Social tags applied successfully!');
                this.patching.set(false);
                this.runAudit();
            },
            error: () => this.patching.set(false)
        });
    }
}
