import { Route } from '@angular/router';
import { Home } from './views/home/home';
import { Registration } from './views/registration/registration';
import { Login } from './views/login/login';
import { Profile } from './views/profile/profile';
import { Activate } from './views/activate/activate';
import { Menu } from './views/menu/menu';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import {CreateDish} from "./views/menu/components/create-dish/create-dish";
import {Categories} from "./views/menu/components/categories/categories";

export const appRoutes: Route[] = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'registration',
    component: Registration,
  },
  {
    path: 'activate',
    component: Activate,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
  },
  {
    path: 'menu',
    component: Menu,
  },
  {
    path: 'menu/create-dish',
    component: CreateDish,
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'menu/categories',
    component: Categories,
    canActivate: [authGuard, roleGuard],
  },
];
