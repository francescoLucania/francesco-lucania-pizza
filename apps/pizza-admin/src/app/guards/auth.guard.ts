import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from '../services/auth/auth-session.service';
import { UserDataService } from '../services/auth/user-data.service';
import { map, filter, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const userDataService = inject(UserDataService);

  // Ждем, пока userData загрузится (не undefined)
  return userDataService.userData$.pipe(
    filter((userData) => userData !== undefined),
    take(1),
    map((userData) => {
      if (session.isAuthenticated() && userData) {
        return true;
      }
      return router.parseUrl('/') as UrlTree;
    }),
  );
};
