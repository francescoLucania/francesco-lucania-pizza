import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
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
import { AuthService } from '../../services/auth';
import { AuthSessionService } from '../../services/auth/auth-session.service';
import { UserDataService } from '../../services/auth';
import { LoginBody, LoginType } from '@francesco-lucania-pizza-models';
import { normalizePhone } from '@francesco-lucania-pizza/utils';
import {filter, switchMap, take} from 'rxjs/operators';
import {tap} from "rxjs";

@Component({
  selector: 'pizza-admin-login',
  imports: [FormsModule, FormField, InputComponent, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly userDataService = inject(UserDataService);
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

  constructor() {
    // Автоматически определяем тип входа при изменении поля логина
    effect(() => {
      const loginValue = this.model().login;
      if (loginValue) {
        const isEmail = loginValue.includes('@');
        const currentLoginType = this.model().loginType;
        const newLoginType = (isEmail ? 'email' : 'phone') as LoginType;

        // Обновляем loginType только если он изменился
        if (currentLoginType !== newLoginType) {
          this.model.update((prev) => ({
            ...prev,
            loginType: newLoginType,
          }));
        }
      }
    });
  }

  public ngOnInit(): void {
    // Подписываемся на изменения userData и редиректим, когда значение изменится с undefined
    this.userDataService.userData$
      .pipe(
        filter((userData) => userData !== undefined),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((userData) => {
        if (this.session.isAuthenticated() && userData) {
          this.router.navigateByUrl('/profile');
        }
      });
  }

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

    // Нормализуем телефон перед отправкой, если вход по телефону
    const normalizedBody: LoginBody = {
      ...body,
      login: body.loginType === 'phone' ? normalizePhone(body.login) : body.login,
    };

    this.authService
      .login(normalizedBody)
      .pipe(
        switchMap(() => this.userDataService.userData$),
        filter(res => Boolean(res)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
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
