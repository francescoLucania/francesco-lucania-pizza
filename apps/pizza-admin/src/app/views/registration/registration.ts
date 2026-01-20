import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegistrationForm } from './components/registration-form/registration-form';
import { AuthService } from '../../services/auth/auth.service';
import {
  RegistrationBody,
  CreateResponse,
} from '@francesco-lucania-pizza-models';

@Component({
  selector: 'pizza-admin-registration',
  imports: [RegistrationForm],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  private readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  protected onFormSubmit(registrationData: RegistrationBody): void {
    this.authService
      .register(registrationData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CreateResponse) => {
          // eslint-disable-next-line no-console
          console.log('Регистрация успешна:', response);
          // TODO: Обработать успешную регистрацию (редирект, показ сообщения и т.д.)
        },
        error: (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('Ошибка регистрации:', error);
          // TODO: Обработать ошибку регистрации (показать сообщение об ошибке)
        },
      });
  }
}
