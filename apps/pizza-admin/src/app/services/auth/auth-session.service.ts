import { Injectable, inject, signal } from '@angular/core';
import { UserDataService } from './user-data.service';
import { PlatformService } from '../platform/platform.service';

const ACCESS_TOKEN_KEY = 'pizza_admin_access_token';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly userDataService = inject(UserDataService);
  private readonly platformService = inject(PlatformService);
  private readonly accessTokenSignal = signal<string | null>(null);
  public readonly authenticated = signal<boolean | undefined>(undefined);

  constructor() {
    this.hydrateFromStorage();
  }

  public accessToken() {
    return this.accessTokenSignal();
  }

  public isAuthenticated(): boolean {
    const userData = this.userDataService.getUserData();
    // Не считаем аутентифицированным, если userData еще не загружен (undefined)
    return Boolean(userData !== undefined && userData !== null && this.authenticated());
  }

  public setAccessToken(token: string | null): void {
    this.accessTokenSignal.set(token);
    this.authenticated.set(Boolean(token));

    if (!this.platformService.isBrowser()) {
      return;
    }
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  public logout(): void {
    this.setAccessToken(null);
  }

  private hydrateFromStorage(): void {
    if (!this.platformService.isBrowser()) {
      return;
    }
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    this.accessTokenSignal.set(accessToken);
    this.authenticated.set(Boolean(accessToken));
  }
}
