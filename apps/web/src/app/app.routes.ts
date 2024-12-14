import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((c) => c.HomePage),
  },
  {
    path: 'processing',
    loadComponent: () => import('./pages/processing/processing.component').then((c) => c.ProcessingPage),
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success.component').then((c) => c.SuccessPage),
  },
  {
    path: 'error',
    loadComponent: () => import('./pages/error/error.component').then((c) => c.ErrorPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
]
