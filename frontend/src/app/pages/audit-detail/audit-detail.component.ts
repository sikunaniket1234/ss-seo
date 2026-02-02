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

    // Manual Evaluation
    manualTitle = signal('');
    manualDescription = signal('');
    evaluationResult = signal<any>(null);

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
}
