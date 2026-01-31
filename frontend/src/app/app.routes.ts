import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuditDetailComponent } from './pages/audit-detail/audit-detail.component';

import { SchedulerComponent } from './pages/scheduler/scheduler.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'sites', component: DashboardComponent },
    { path: 'audit/:id', component: AuditDetailComponent },
    { path: 'scheduler', component: SchedulerComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '**', redirectTo: '' }
];
