import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject,
  provideAppInitializer,
} from '@angular/core';
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
import { AuthService } from './services/auth';
import { UserDataService } from './services/auth';
import { PlatformService } from './services/platform/platform.service';
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
      const platformService = inject(PlatformService);

      if (platformService.isBrowser()) {
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
      // На сервере всегда null (уже установлено в конструкторе UserDataService)
      userDataService.setUserData(null);
      return of(null);
    }),
  ],
};
