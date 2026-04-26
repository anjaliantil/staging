import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'remote',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Routes'
      }).then(m => m.routes)
  },
  {
    path: 'react',
    loadComponent: () => import('./remote/react-wrapper.component').then(m => m.ReactWrapperComponent),
    data: {
      remoteEntry: 'http://localhost:4202/remoteEntry.js',
      exposedModule: './App'
    }
  }
];