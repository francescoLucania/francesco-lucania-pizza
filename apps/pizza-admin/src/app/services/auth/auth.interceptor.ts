import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';

// Глобальные переменные для управления обновлением токена
let isRefreshing = false;
const refreshTokenSubject: Subject<string | null> = new Subject<
  string | null
>();

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const session = inject(AuthSessionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = session.accessToken();
  // if (!token) {
  //   return next(req);
  // }

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Проверяем, что это не запрос на refresh, чтобы избежать бесконечного цикла
      const isRefreshRequest = req.url.includes('user/refresh');

      if (error.status === 401 && !isRefreshRequest) {
        session.authenticated.set(false);
        // Вызываем handle401Error, который должен сделать refresh
        // Важно: возвращаем Observable из handle401Error, который будет подписан
        return handle401Error(req, next, session, authService, router);
      }
      return throwError(() => error);
    }),
  );
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  session: AuthSessionService,
  authService: AuthService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    // Если уже идет обновление токена, ждем его завершения
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(newReq);
      }),
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  // Refresh token хранится в httpOnly cookie, поэтому просто пытаемся обновить
  // Важно: refresh() должен быть вызван здесь, чтобы обновить токен
  // Этот Observable будет подписан автоматически, когда интерцептор вернет его
  return authService.refresh().pipe(
    switchMap((response: { accessToken: string; refreshToken?: string }) => {
      isRefreshing = false;
      session.setAccessToken(response.accessToken);
      refreshTokenSubject.next(response.accessToken);

      // Повторяем оригинальный запрос с новым токеном
      const newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });
      return next(newReq);
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      session.authenticated.set(false);
      session.logout();
      void router.navigateByUrl('/');
      return throwError(() => refreshError);
    }),
  );
}
