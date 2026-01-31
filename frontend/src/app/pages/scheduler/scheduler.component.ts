import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scheduler',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="scheduler-page glass-card">
            <h2>Automation Scheduler</h2>
            <p class="text-muted mb-6">Configure background SEO audits for your sites.</p>

            <div class="scheduler-controls flex flex-col gap-6">
                <div class="control-item">
                    <label>Audit Frequency</label>
                    <select class="form-select">
                        <option>Every 24 Hours</option>
                        <option>Every 12 Hours</option>
                        <option>Every Week</option>
                    </select>
                </div>

                <div class="control-item">
                    <label>Notification Email</label>
                    <input type="email" placeholder="agency@example.com" class="form-input">
                </div>

                <div class="status-summary">
                    <div class="flex justify-between mb-2">
                        <span>Active Audits</span>
                        <span class="badge badge-success">Running</span>
                    </div>
                    <p class="text-sm text-muted">Last global sync: 2 hours ago</p>
                </div>

                <button class="btn btn-primary" (click)="saveSchedule()">Save Configuration</button>
            </div>
        </div>
    `,
    styles: [`
        .scheduler-page { max-width: 600px; margin: 0 auto; }
        .control-item { display: flex; flex-direction: column; gap: 8px; }
        .form-select, .form-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--surface-border);
            padding: 10px;
            color: white;
            border-radius: 8px;
            outline: none;
        }
        .badge {
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .text-muted { color: var(--text-muted); }
        .mb-6 { margin-bottom: 24px; }
    `]
})
export class SchedulerComponent {
    saveSchedule() {
        alert('Schedule saved! (Simulation)');
    }
}
