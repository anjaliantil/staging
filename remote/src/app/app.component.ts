import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mfe-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="remote-app">
      <h2>Remote Micro-frontend</h2>
      <p>This component is loaded dynamically from the remote application.</p>
      <div class="features">
        <h3>Features:</h3>
        <ul>
          <li>Independent deployment</li>
          <li>Lazy loaded on demand</li>
          <li>Shared Angular runtime</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .remote-app {
      padding: 1rem;
      border: 2px solid #007bff;
      border-radius: 8px;
      background: #f8f9fa;
    }
    .features {
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 4px;
    }
    ul {
      list-style: disc;
      padding-left: 1.5rem;
    }
    li {
      margin: 0.5rem 0;
    }
  `]
})
export class AppComponent {}