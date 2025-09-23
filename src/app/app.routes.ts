import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'certificar',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
    // TODO: Crear componente de certificar
  },
  {
    path: 'certificaciones',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
    // TODO: Crear componente de certificaciones
  },
  {
    path: 'matriz-entrenamiento',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
    // TODO: Crear componente de matriz de entrenamiento
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
