import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserDataService } from './user-data.service';

const ACCESS_TOKEN_KEY = 'pizza_admin_access_token';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userDataService = inject(UserDataService);
  private readonly accessTokenSignal = signal<string | null>(null);

  constructor() {
    this.hydrateFromStorage();
  }

  public accessToken() {
    return this.accessTokenSignal();
  }

  public isAuthenticated(): boolean {
    return Boolean(this.userDataService.getUserData());
  }

  public setAccessToken(token: string | null): void {
    this.accessTokenSignal.set(token);

    if (!isPlatformBrowser(this.platformId)) {
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    this.accessTokenSignal.set(accessToken);
  }
}
