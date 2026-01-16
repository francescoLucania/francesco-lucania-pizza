import { RenderMode, ServerRoute } from '@angular/ssr';
import {Home} from "./views/home/home";
import {Registration} from "./views/registration/registration";

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'registration',
    renderMode: RenderMode.Prerender,
  },
];
