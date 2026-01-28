import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  form,
  required,
  ValidationError,
  FieldState,
} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import {
  ButtonComponent,
  InputComponent,
} from '@francesco-lucania-pizza/angular-ui';
import { AuthService, LoginResponse } from '../../services/auth/auth.service';
import { AuthSessionService } from '../../services/auth/auth-session.service';
import { LoginBody } from '@francesco-lucania-pizza-models';

@Component({
  selector: 'pizza-admin-login',
  imports: [FormsModule, FormField, InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorText = signal<string | null>(null);

  protected readonly model = signal<LoginBody>({
    login: '',
    password: '',
    loginType: 'email',
  });

  protected readonly loginForm = form(this.model, (schema) => {
    required(schema.login);
    required(schema.password);
  });

  protected shouldShowError(
    fieldName: string,
    fieldFn: () => FieldState<unknown>,
  ): boolean {
    const fieldState = fieldFn();
    return (this.submitted() && fieldState.invalid()) || fieldState.touched();
  }

  protected getErrorMessage(errors: readonly ValidationError[]): string {
    if (!errors || errors.length === 0) {
      return '';
    }
    const firstError = errors[0];
    if (firstError.message) {
      return firstError.message;
    }
    if (firstError.kind === 'required') {
      return 'Это поле обязательно для заполнения';
    }
    return 'Ошибка валидации';
  }

  protected send(): void {
    this.submitted.set(true);
    this.errorText.set(null);

    if (!this.loginForm().valid()) {
      return;
    }

    this.isLoading.set(true);
    const body = this.model();

    this.authService
      .login(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: LoginResponse) => {
          this.session.setAccessToken(res.accessToken);
          this.isLoading.set(false);
          void this.router.navigateByUrl('/profile');
        },
        error: () => {
          this.isLoading.set(false);
          this.errorText.set('Не удалось войти. Проверьте логин/пароль.');
        },
      });
  }
}
