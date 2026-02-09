import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import { AuthService } from '../../services/auth/auth.service';
import { AuthSessionService } from '../../services/auth/auth-session.service';
import { UserProfile } from '@francesco-lucania-pizza-models';
import { ApiService } from '../../services/api/api.service';
import { environment } from '../../../environments';

@Component({
  selector: 'pizza-admin-profile',
  imports: [ButtonComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly staticEndpoint = signal(environment.staticUrl);
  protected readonly profile = signal<UserProfile | null>(null);
  protected readonly errorText = signal<string | null>(null);
  protected readonly avatarUploading = signal(false);
  protected readonly avatarError = signal<string | null>(null);

  constructor() {
    this.authService
      .getUserData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.errorText.set('Не удалось загрузить профиль.');
          this.loading.set(false);
        },
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
          // Даже если запрос не удался, очищаем локальную сессию
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
        },
        error: () => {
          this.avatarUploading.set(false);
          this.avatarError.set(
            'Не удалось загрузить аватар. Попробуйте ещё раз.',
          );
        },
      });
  }
}
