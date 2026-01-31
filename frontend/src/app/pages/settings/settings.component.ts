import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="settings-page glass-card">
            <h2>Agency Settings</h2>
            <p class="text-muted mb-6">Manage your SEO engine and profile.</p>

            <div class="settings-grid">
                <section class="settings-section">
                    <h3>AI Intelligence</h3>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" checked> Use GPT-Heuristics for meta generation
                        </label>
                        <p class="help-text">Automatically generates high-intent titles and descriptions.</p>
                    </div>
                </section>

                <section class="settings-section">
                    <h3>Integration</h3>
                    <div class="control-group">
                        <label>Base Proxy Port</label>
                        <input type="number" value="3000" class="form-input">
                    </div>
                </section>

                <button class="btn btn-primary mt-6">Apply Changes</button>
            </div>
        </div>
    `,
    styles: [`
        .settings-page { max-width: 800px; margin: 0 auto; }
        .settings-section { margin-bottom: 32px; }
        .settings-section h3 { margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px; }
        .control-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .help-text { font-size: 12px; color: var(--text-muted); }
        .form-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--surface-border);
            padding: 10px;
            color: white;
            border-radius: 8px;
            width: 100px;
        }
    `]
})
export class SettingsComponent { }
