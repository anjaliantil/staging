import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,RouterLink],
  template: `
    <header>
      <nav>
        <a routerLink="/home">Home</a>
        <a routerLink="/remote">Angular Remote</a>
        <a routerLink="/react">React Remote</a>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    header {
      background: #333;
      padding: 1rem;
    }
    nav {
      display: flex;
      gap: 1rem;
    }
    a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }
    a:hover {
      background: #555;
    }
    main {
      padding: 2rem;
    }
  `]
})
export class AppComponent {}