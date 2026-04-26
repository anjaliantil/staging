import { Component } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Component({
  selector: 'app-remote',
  standalone: true,
  template: `
    <div class="remote-container">
      <h1>Remote Micro-frontend</h1>
      <ng-container *ngIf="loaded; else loading">
        <mfe-root></mfe-root>
      </ng-container>
      <ng-template #loading>
        <p>Loading remote module...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .remote-container {
      padding: 1rem;
    }
  `]
})
export class RemoteComponent {
  loaded = false;

  constructor() {
//this.loadRemote();
  }

  async loadRemote() {
    try {
      await loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Component'
      });
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load remote module:', error);
    }
  }
}