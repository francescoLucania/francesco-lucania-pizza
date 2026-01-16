import { Route } from '@angular/router';
import {Home} from "./views/home/home";
import {Registration} from "./views/registration/registration";
import {RenderMode} from "@angular/ssr";

export const appRoutes: Route[] = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'registration',
    component: Registration,
  },
];
