import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject,
  provideAppInitializer,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { authInterceptor } from './services/auth/auth.interceptor';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { UserDataService } from './services/auth/user-data.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch(), // Используем fetch API, который автоматически отправляет cookies
    ),
    provideRouter(appRoutes),
    provideAppInitializer(() => {
      // Inject services directly within the function
      const authService = inject(AuthService);
      const userDataService = inject(UserDataService);
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        // Не используем catchError здесь, чтобы интерцептор мог обработать 401 и сделать refresh
        // Ошибки будут обработаны интерцептором, который попытается обновить токен
        return authService.getUserData().pipe(
          catchError((e) => {
            // Обрабатываем ошибку только если интерцептор не смог её обработать
            // (например, если refresh тоже не удался)
            userDataService.setUserData(null);
            return of(null);
          }),
        );
      }
      userDataService.setUserData(null);
      return of(null);
    }),
  ],
};
