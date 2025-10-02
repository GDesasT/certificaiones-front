//=================[Importaciones]=========
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Certificar } from './components/certificar/certificar';
import { Certificaciones } from './components/certificaciones/certificaciones';
import { Matriz } from './components/matriz/matriz';
import { Login } from './components/login/login';
import { HeadCount } from './head-count/head-count';
import { roleGuard } from './core/auth/role.guard';
import { Unauthorized } from './components/unauthorized/unauthorized';
import { DevPanel } from './components/dev-panel/dev-panel';
import { Approvals } from './components/approvals/approvals';

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
    component: Home,
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin','dev','trainer','mantenimiento','produccion','calidad','employee'] }
  },
  {
    path: 'certificar',
    component: Certificar,
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin','dev','trainer'] }
  },
  {
    path: 'certificaciones',
    component: Certificaciones,
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin','dev','trainer','mantenimiento','produccion','calidad','employee'] }
  },
  {
    path: 'matriz-entrenamiento',
    component: Matriz,
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin','dev', 'trainer', 'mantenimiento', 'produccion', 'calidad', 'employee'] }
  },
  {
    path: 'dev',
    component: DevPanel,
    canActivate: [roleGuard],
    data: { allowedRoles: ['dev'] }
  },
  {
    path: 'unauthorized',
    component: Unauthorized
  },
  {
    path: 'head-count',
    component: HeadCount,
    canActivate: [roleGuard],
    data: { allowedRoles: ['dev', 'admin'] }
  },
  {
    path: 'aprobaciones',
    component: Approvals,
    canActivate: [roleGuard],
    data: { allowedRoles: ['admin','dev','mantenimiento','produccion','calidad'] }
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
