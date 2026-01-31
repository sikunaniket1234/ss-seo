import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UiService {
    showAddSiteModal = signal(false);

    openAddSiteModal() {
        this.showAddSiteModal.set(true);
    }

    closeAddSiteModal() {
        this.showAddSiteModal.set(false);
    }
}
