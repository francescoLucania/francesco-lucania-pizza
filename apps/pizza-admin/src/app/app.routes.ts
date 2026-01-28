import { Route } from '@angular/router';
import { Home } from './views/home/home';
import { Registration } from './views/registration/registration';
import { Login } from './views/login/login';
import { Profile } from './views/profile/profile';
import { Activate } from './views/activate/activate';
import { authGuard } from './guards/auth.guard';

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
];
