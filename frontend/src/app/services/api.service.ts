import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Site, SEOAuditReport, SiteReport } from '../models/seo.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:5001/api';

    constructor(private http: HttpClient) { }

    getSites(): Observable<Site[]> {
        return this.http.get<Site[]>(`${this.baseUrl}/sites`);
    }

    addSite(site: Partial<Site>): Observable<Site> {
        return this.http.post<Site>(`${this.baseUrl}/sites`, site);
    }

    analyzeSite(id: string): Observable<SiteReport> {
        return this.http.post<SiteReport>(`${this.baseUrl}/sites/${id}/analyze`, {});
    }

    generateTechnicalFiles(id: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/sites/${id}/generate-technical`, {});
    }

    patchSite(id: string, patch: any): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/sites/${id}/patch`, { patch });
    }
}
