import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import { RegistrationForm } from '../../components/registration-form/registration-form';
import { AuthService } from '../../services/auth/auth.service';
import {
  RegistrationBody,
  CreateResponse,
} from '@francesco-lucania-pizza-models';
import { Router } from '@angular/router';
import { extractServerErrorCode } from '../../utils/extract-server-error-code';
import { normalizePhone } from '@francesco-lucania-pizza/utils';
import {
  createEmptyRegistrationModel,
  createRegistrationFormFields,
  isRegistrationFormValid,
} from '../../components/registration-form/registration-form.utils';

@Component({
  selector: 'pizza-admin-registration',
  imports: [RegistrationForm, ButtonComponent],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {
  private readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly serverError = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly registrationModel = signal<RegistrationBody>(
    createEmptyRegistrationModel(),
  );
  protected readonly registrationForm = createRegistrationFormFields(
    this.registrationModel,
  );

  protected send(): void {
    this.submitted.set(true);

    if (!isRegistrationFormValid(this.registrationForm)) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.registrationModel();
    const registrationData: RegistrationBody = {
      ...formValue,
      phone: normalizePhone(formValue.phone),
    };

    this.onFormSubmit(registrationData);
  }

  private onFormSubmit(registrationData: RegistrationBody): void {
    this.serverError.set(null);
    this.authService
      .register(registrationData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CreateResponse) => {
          this.isLoading.set(false);
          // eslint-disable-next-line no-console
          console.log('Регистрация успешна:', response);
          void this.router.navigateByUrl('/activate');
        },
        error: (error: unknown) => {
          this.isLoading.set(false);
          // eslint-disable-next-line no-console
          console.error('Ошибка регистрации:', error);
          this.serverError.set(extractServerErrorCode(error));
        },
      });
  }
}
