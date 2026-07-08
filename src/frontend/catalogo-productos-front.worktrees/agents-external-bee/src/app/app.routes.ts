import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./modules/productos/pages/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent)
  },
  // Redirección por defecto: si entran a http://localhost:4200/ los mandamos al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Comodín por si escriben una ruta que no existe
  { path: '**', redirectTo: 'login' }
];