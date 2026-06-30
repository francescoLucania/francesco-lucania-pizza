import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  RegistrationBody,
  CreateResponse,
  LoginBody,
  UpdatePasswordBody,
  UpdateUserBody,
  UserProfile,
} from '@francesco-lucania-pizza-models';
import { UserDataService } from './user-data.service';
import {AuthSessionService} from "./auth-session.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly session = inject(AuthSessionService);
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

  public login(body: LoginBody): Observable<UserProfile> {
    return this.apiService.post<UserProfile>('user/login', body)
      .pipe(
        tap((data) => {
          if (data.accessToken) {
            this.session.setAccessToken(data.accessToken);
          }
          this.userService.setUserData(data);
        }),
      );
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

  public updateUser(userData: UpdateUserBody): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('user/update', userData).pipe(
      tap((data) => {
        this.userService.setUserData(data);
      }),
    );
  }

  public updatePassword(body: UpdatePasswordBody): Observable<UserProfile> {
    return this.apiService.put<UserProfile>('user/updatePassword', body).pipe(
      tap((data) => {
        this.userService.setUserData(data);
      }),
    );
  }

  public refresh(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('user/refresh');
  }

  public logout(): Observable<{ action: string }> {
    return this.apiService.get<{ action: string }>('user/logout');
  }
}
