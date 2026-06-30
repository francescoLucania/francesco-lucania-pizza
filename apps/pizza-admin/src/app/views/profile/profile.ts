import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import { AuthService } from '../../services/auth/auth.service';
import { AuthSessionService } from '../../services/auth/auth-session.service';
import {
  Gender,
  RegistrationBody,
  UpdatePasswordBody,
  UpdateUserBody,
  UserProfile,
} from '@francesco-lucania-pizza-models';
import { environment } from '../../../environments';
import { UserDataService } from '../../services/auth';
import { filter } from 'rxjs/operators';
import { RegistrationForm } from '../../components/registration-form/registration-form';
import { extractServerErrorCode } from '../../utils/extract-server-error-code';
import { normalizePhone } from '@francesco-lucania-pizza/utils';
import {
  createEmptyRegistrationModel,
  createProfileUpdateFormFields,
  formatPhoneForInput,
  isProfileUpdateFormValid,
} from '../../components/registration-form/registration-form.utils';
import { DateReadablePipe } from '../../pipes/date-readable.pipe';
import { ChangePasswordForm } from '../../components/change-password-form/change-password-form';
import {
  createChangePasswordFormFields,
  createEmptyChangePasswordModel,
  isChangePasswordFormValid,
} from '../../components/change-password-form/change-password-form.utils';

@Component({
  selector: 'pizza-admin-profile',
  imports: [ButtonComponent, RegistrationForm, ChangePasswordForm, DateReadablePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userDataService = inject(UserDataService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly staticEndpoint = signal(environment.staticUrl);
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly errorText = signal<string | null>(null);
  protected readonly avatarUploading = signal(false);
  protected readonly avatarError = signal<string | null>(null);
  protected readonly isEditing = signal(false);
  protected readonly isChangingPassword = signal(false);
  protected readonly formSubmitting = signal(false);
  protected readonly formServerError = signal<string | null>(null);
  protected readonly passwordFormSubmitting = signal(false);
  protected readonly passwordFormServerError = signal<string | null>(null);
  protected readonly successText = signal<string | null>(null);
  protected readonly formSubmitted = signal(false);
  protected readonly passwordFormSubmitted = signal(false);
  protected readonly updateFormModel = signal<RegistrationBody>(
    createEmptyRegistrationModel(),
  );
  protected readonly updateForm = createProfileUpdateFormFields(
    this.updateFormModel,
  );
  protected readonly passwordFormModel = signal(createEmptyChangePasswordModel());
  protected readonly passwordForm = createChangePasswordFormFields(
    this.passwordFormModel,
  );

  protected getProfileImageUrl(picture: string | undefined): string {
    const base = this.staticEndpoint().replace(/\/+$/, '');
    const normalizedPicture = (picture || '/image/menu/dishes/unknown.jpg').replace(
      /^\/+/,
      '',
    );
    return `${base}/${normalizedPicture}`;
  }

  protected getGenderLabel(gender: Gender): string {
    return gender === 'female' ? 'Женский' : 'Мужской';
  }

  public ngOnInit(): void {
    this.userDataService.userData$
      .pipe(
        filter((data) => Boolean(data)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.profile.set(data);
          }
          this.loading.set(false);
        },
        error: () => {
          this.errorText.set('Не удалось загрузить профиль.');
          this.loading.set(false);
        },
      });
  }

  protected startEditing(): void {
    const data = this.profile();
    if (!data) {
      return;
    }

    this.isChangingPassword.set(false);
    this.passwordFormServerError.set(null);
    this.passwordFormSubmitted.set(false);

    this.updateFormModel.set({
      email: data.email,
      phone: formatPhoneForInput(data.phone),
      name: data.name,
      fullName: data.fullName,
      gender: data.gender,
      dateIssue: data.dateIssue,
      password: '',
    });
    this.formSubmitted.set(false);
    this.formServerError.set(null);
    this.successText.set(null);
    this.isEditing.set(true);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.formServerError.set(null);
    this.formSubmitted.set(false);
  }

  protected startChangingPassword(): void {
    this.isEditing.set(false);
    this.formServerError.set(null);
    this.formSubmitted.set(false);
    this.passwordFormModel.set(createEmptyChangePasswordModel());
    this.passwordFormServerError.set(null);
    this.passwordFormSubmitted.set(false);
    this.successText.set(null);
    this.isChangingPassword.set(true);
  }

  protected cancelChangingPassword(): void {
    this.isChangingPassword.set(false);
    this.passwordFormServerError.set(null);
    this.passwordFormSubmitted.set(false);
  }

  protected sendPasswordUpdate(): void {
    this.passwordFormSubmitted.set(true);

    if (!isChangePasswordFormValid(this.passwordForm, this.passwordFormModel())) {
      return;
    }

    const { oldPassword, newPassword } = this.passwordFormModel();
    this.onPasswordUpdate({ oldPassword, newPassword });
  }

  protected sendProfileUpdate(): void {
    this.formSubmitted.set(true);

    if (!isProfileUpdateFormValid(this.updateForm)) {
      return;
    }

    const { phone, name, fullName } = this.updateFormModel();
    this.onProfileUpdate({
      phone: normalizePhone(phone),
      name,
      fullName,
    });
  }

  protected logout(): void {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.session.logout();
          void this.router.navigateByUrl('/');
        },
        error: () => {
          this.session.logout();
          void this.router.navigateByUrl('/');
        },
      });
  }

  protected onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.avatarError.set(null);
    this.avatarUploading.set(true);

    this.authService
      .uploadAvatar(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.avatarUploading.set(false);
          this.profile.update((p) => (p ? { ...p, picture: res.picture } : p));
          this.userDataService.setUserData({
            ...this.profile()!,
            picture: res.picture,
          });
        },
        error: () => {
          this.avatarUploading.set(false);
          this.avatarError.set(
            'Не удалось загрузить аватар. Попробуйте ещё раз.',
          );
        },
      });
  }

  private onProfileUpdate(formData: UpdateUserBody): void {
    this.formServerError.set(null);
    this.successText.set(null);
    this.formSubmitting.set(true);

    this.authService
      .updateUser(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProfile) => {
          this.formSubmitting.set(false);
          this.profile.set(updatedProfile);
          this.isEditing.set(false);
          this.formSubmitted.set(false);
          this.successText.set('Данные профиля успешно обновлены.');
        },
        error: (error: unknown) => {
          this.formSubmitting.set(false);
          const code = extractServerErrorCode(error);
          if (code) {
            this.formServerError.set(code);
            return;
          }

          this.formServerError.set('UPDATE_FAILED');
        },
      });
  }

  private onPasswordUpdate(body: UpdatePasswordBody): void {
    this.passwordFormServerError.set(null);
    this.successText.set(null);
    this.passwordFormSubmitting.set(true);

    this.authService
      .updatePassword(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProfile) => {
          this.passwordFormSubmitting.set(false);
          this.profile.set(updatedProfile);
          this.isChangingPassword.set(false);
          this.passwordFormSubmitted.set(false);
          this.passwordFormModel.set(createEmptyChangePasswordModel());
          this.successText.set('Пароль успешно изменён.');
        },
        error: (error: unknown) => {
          this.passwordFormSubmitting.set(false);
          const code = extractServerErrorCode(error);
          if (code) {
            this.passwordFormServerError.set(code);
            return;
          }

          this.passwordFormServerError.set('UPDATE_PASSWORD_FAILED');
        },
      });
  }
}
