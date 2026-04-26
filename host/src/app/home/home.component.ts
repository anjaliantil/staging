import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home">
      <h1>Host Application - Home</h1>
      <p>Welcome to the micro-frontend POC using Angular 18 with Module Federation.</p>
      <div class="info">
        <h3>Architecture:</h3>
        <ul>
          <li><strong>Host (Shell):</strong> Main application on port 4200</li>
          <li><strong>Remote:</strong> Standalone micro-frontend on port 4201</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .home {
      max-width: 800px;
    }
    .info {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
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
export class HomeComponent {}