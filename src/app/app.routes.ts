//=================[Importaciones]=========
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Certificar } from './components/certificar/certificar';
import { Certificaciones } from './components/certificaciones/certificaciones';
import { Matriz } from './components/matriz/matriz';
import { Login } from './components/login/login';

//=================[Configuración de Rutas]=========
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
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
