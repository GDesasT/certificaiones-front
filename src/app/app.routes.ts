import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Certificaciones } from './components/certificaciones/certificaciones';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: Home
  },
  {
    path: 'certificar',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
    // TODO: Crear componente de certificar
  },
  {
    path: 'certificaciones',
    loadComponent: () => import('./components/certificaciones/certificaciones').then(m => m.Certificaciones)
    // TODO: Crear componente de certificaciones
  },
  {
    path: 'matriz-entrenamiento',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
    // TODO: Crear componente de matriz de entrenamiento
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
