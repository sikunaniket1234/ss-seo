import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UiService } from './services/ui.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('frontend');

  constructor(
    private ui: UiService,
    private router: Router
  ) { }

  onNewSite() {
    this.router.navigate(['/sites']).then(() => {
      this.ui.openAddSiteModal();
    });
  }
}
