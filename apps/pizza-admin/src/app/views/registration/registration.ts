import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegistrationForm } from './components/registration-form/registration-form';
import { AuthService } from '../../services/auth/auth.service';
import {
  RegistrationBody,
  CreateResponse,
} from '@francesco-lucania-pizza-models';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'pizza-admin-registration',
  imports: [RegistrationForm],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  private readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly serverError = signal<string | null>(null);

  protected onFormSubmit(registrationData: RegistrationBody): void {
    this.serverError.set(null);
    this.authService
      .register(registrationData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CreateResponse) => {
          // eslint-disable-next-line no-console
          console.log('Регистрация успешна:', response);
          void this.router.navigateByUrl('/activate');
        },
        error: (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('Ошибка регистрации:', error);
          const code = this.extractServerErrorCode(error);
          this.serverError.set(code);
        },
      });
  }

  private extractServerErrorCode(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      // Nest ValidationException sends raw string like 'BUSY_PHONE'
      const err = error.error as any;
      if (typeof err === 'string') {
        return err;
      }
      if (err && typeof err.message === 'string') {
        return err.message;
      }
      if (err && typeof err.messages === 'string') {
        return err.messages;
      }
      if (err && typeof err.error === 'string') {
        return err.error;
      }
    }
    return null;
  }
}
