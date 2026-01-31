import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SEOAuditReport, SiteReport, Site } from '../../models/seo.models';

@Component({
    selector: 'app-audit-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
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

        this.patching.set(true);
        this.api.patchSite(this.siteId, report.suggestedTags).subscribe({
            next: (res) => {
                alert('Patch applied successfully to current page!');
                this.patching.set(false);
                this.runAudit(); // Refresh report
            },
            error: (err) => {
                alert('Failed to apply patch.');
                this.patching.set(false);
            }
        });
    }

    generateTechnical() {
        this.generatingTechnical.set(true);
        this.api.generateTechnicalFiles(this.siteId).subscribe({
            next: (res) => {
                alert('Sitemap.xml and Robots.txt generated locally!');
                this.generatingTechnical.set(false);
            },
            error: (err) => {
                alert('Failed to generate technical files.');
                this.generatingTechnical.set(false);
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
