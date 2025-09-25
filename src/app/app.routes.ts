import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Certificar } from './components/certificar/certificar';
import { Certificaciones } from './components/certificaciones/certificaciones';
import { Matriz } from './components/matriz/matriz';

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
    component: Certificar
  },
  {
    path: 'certificaciones',
    component: Certificaciones
  },
  {
    path: 'matriz-entrenamiento',
    component: Matriz
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
