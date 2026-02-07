import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  RegistrationBody,
  CreateResponse,
  LoginBody,
  UserProfile,
} from '@francesco-lucania-pizza-models';
import { UserDataService } from './user-data.service';

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  lastActivity?: string;
  id?: unknown;
  isActivated?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly userService = inject(UserDataService);

  /**
   * Отправляет запрос на регистрацию пользователя
   * @param registrationData - данные для регистрации
   * @returns Observable с данными созданного пользователя
   */
  public register(
    registrationData: RegistrationBody,
  ): Observable<CreateResponse> {
    return this.apiService.post<CreateResponse>(
      'user/create',
      registrationData,
    );
  }

  public login(body: LoginBody): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('user/login', body);
  }

  public getUserData(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('user/getUserData').pipe(
      tap((data) => {
        this.userService.setUserData(data);
      }),
    );
  }

  public activate(activationId: string): Observable<{
    activation: boolean;
    userInfo: { name: string; fullName: string; email: string };
  }> {
    return this.apiService.get(
      `user/activate?id=${encodeURIComponent(activationId)}`,
    );
  }

  public uploadAvatar(file: File): Observable<{ picture: string }> {
    return this.apiService.uploadFile<{ picture: string }>(
      'user/uploadAvatar',
      {
        file,
        fieldName: 'avatar',
      },
    );
  }

  public refresh(): Observable<LoginResponse> {
    return this.apiService.get<LoginResponse>('user/refresh');
  }
}
