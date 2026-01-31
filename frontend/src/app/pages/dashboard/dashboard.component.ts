import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { Site } from '../../models/seo.models';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    sites = signal<Site[]>([]);
    totalSites = signal(0);
    averageScore = signal(0);

    constructor(
        private api: ApiService,
        public ui: UiService
    ) { }

    ngOnInit() {
        this.loadSites();
    }

    loadSites() {
        this.api.getSites().subscribe(sites => {
            this.sites.set(sites);
            this.totalSites.set(sites.length);
            const scores = sites.map(s => s.averageScore || 0);
            if (scores.length > 0) {
                this.averageScore.set(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
            }
        });
    }

    addSite(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const site = {
            name: formData.get('name') as string,
            localPath: formData.get('localPath') as string,
            url: formData.get('url') as string
        };

        this.api.addSite(site).subscribe(() => {
            this.ui.closeAddSiteModal();
            this.loadSites();
        });
    }

    getScoreClass(score: number | undefined): string {
        if (!score) return 'score-low';
        if (score >= 80) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }
}
