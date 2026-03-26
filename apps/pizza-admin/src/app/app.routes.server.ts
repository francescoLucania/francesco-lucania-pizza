import { RenderMode, ServerRoute } from '@angular/ssr';
import { Home } from './views/home/home';
import { Registration } from './views/registration/registration';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'registration',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'activate',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Server,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client,
  },
  {
    path: 'menu',
    renderMode: RenderMode.Server,
  },
  {
    path: 'menu/create-dish',
    renderMode: RenderMode.Client,
  },
  {
    path: 'menu/edit-dish/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'menu/dish/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'menu/categories',
    renderMode: RenderMode.Client,
  },
];
