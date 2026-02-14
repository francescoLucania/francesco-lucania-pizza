import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { UserDataService } from '../services/auth/user-data.service';
import { AuthSessionService } from '../services/auth/auth-session.service';
import { map, filter, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = () => {
  const userDataService = inject(UserDataService);
  const session = inject(AuthSessionService);
  const router = inject(Router);

  // На сервере всегда null, на клиенте может быть undefined (данные еще не загружены)
  // Ждем, пока userData загрузится (не undefined на клиенте)
  return userDataService.userData$.pipe(
    filter((userData) => userData !== undefined),
    take(1),
    map((userData) => {
      if (!session.isAuthenticated()) {
        return router.parseUrl('/login') as UrlTree;
      }

      if (!userData) {
        return router.parseUrl('/login') as UrlTree;
      }

      const allowedRoles = ['admin', 'user'];
      if (allowedRoles.includes(userData.role)) {
        return true;
      }

      return router.parseUrl('/') as UrlTree;
    }),
  );
};
