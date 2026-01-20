import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  RegistrationBody,
  CreateResponse,
} from '@francesco-lucania-pizza-models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);

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
}
