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
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth/auth.interceptor';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { AuthService } from './services/auth/auth.service';
import { UserDataService } from './services/auth/user-data.service';
import { firstValueFrom, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(appRoutes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    provideAppInitializer(() => {
      // Inject services directly within the function
      const authService = inject(AuthService);
      const userDataService = inject(UserDataService);
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        return authService.getUserData().pipe(
          catchError((e) => {
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
