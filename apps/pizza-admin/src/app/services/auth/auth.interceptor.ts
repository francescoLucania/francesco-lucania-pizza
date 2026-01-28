import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly session = inject(AuthSessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private isRefreshing = false;
  private refreshTokenSubject: Subject<string | null> = new Subject<
    string | null
  >();

  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.session.accessToken();
    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('user/refresh')) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      // Если уже идет обновление токена, ждем его завершения
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(newReq);
        }),
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    // Refresh token хранится в httpOnly cookie, поэтому просто пытаемся обновить
    return this.authService.refresh().pipe(
      switchMap((response: { accessToken: string; refreshToken?: string }) => {
        this.isRefreshing = false;
        this.session.setAccessToken(response.accessToken);
        this.refreshTokenSubject.next(response.accessToken);

        // Повторяем оригинальный запрос с новым токеном
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });
        return next.handle(newReq);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.session.logout();
        void this.router.navigateByUrl('/');
        return throwError(() => error);
      }),
    );
  }
}
