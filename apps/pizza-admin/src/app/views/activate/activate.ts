import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import {
  ButtonComponent,
  InputComponent,
} from '@francesco-lucania-pizza/angular-ui';
import {
  form,
  required,
  ValidationError,
  FieldState,
} from '@angular/forms/signals';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'pizza-admin-activate',
  imports: [FormsModule, FormField, InputComponent, ButtonComponent],
  templateUrl: './activate.html',
  styleUrl: './activate.scss',
})
export class Activate {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorText = signal<string | null>(null);
  protected readonly successText = signal<string | null>(null);

  protected readonly model = signal<{ activationCode: string }>({
    activationCode: '',
  });

  protected readonly activateForm = form(this.model, (schema) => {
    required(schema.activationCode);
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.model.update((m) => ({ ...m, activationCode: id }));
          this.activate(id);
        }
      });
  }

  protected shouldShowError(fieldFn: () => FieldState<unknown>): boolean {
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
      return 'Введите код активации';
    }
    return 'Ошибка валидации';
  }

  protected send(): void {
    this.submitted.set(true);
    this.errorText.set(null);
    this.successText.set(null);

    if (!this.activateForm().valid()) {
      return;
    }

    const code = this.model().activationCode.trim();
    this.activate(code);
  }

  private activate(code: string): void {
    if (!code) {
      return;
    }

    this.isLoading.set(true);
    this.errorText.set(null);
    this.successText.set(null);

    this.authService
      .activate(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.activation) {
            this.successText.set('Активация успешна! Ваш аккаунт активирован.');
            setTimeout(() => void this.router.navigateByUrl('/login'), 2000);
          } else {
            this.errorText.set('Не удалось активировать аккаунт.');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorText.set(
            'Неверный код активации. Проверьте код и попробуйте ещё раз.',
          );
        },
      });
  }
}
