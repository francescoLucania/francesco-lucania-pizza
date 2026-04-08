import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import type { Dish } from '@francesco-lucania-pizza-models';
import { environment } from '../../../../../environments/environment';
import { UserDataService } from '../../../../services/auth/user-data.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-dish-details',
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './dish-details.html',
  styleUrl: './dish-details.scss',
})
export class DishDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuService = inject(MenuService);
  private readonly userDataService = inject(UserDataService);

  protected readonly dish = signal<Dish | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly errorText = signal<string | null>(null);
  protected readonly staticUrl = environment.staticUrl;

  protected readonly isAdmin = computed(() => {
    const userData = this.userDataService.getUserData();
    return userData?.role === 'admin';
  });

  public ngOnInit(): void {
    const dishId = this.route.snapshot.paramMap.get('id');
    if (!dishId) {
      this.errorText.set('Не передан id блюда');
      return;
    }

    this.loadDish(dishId);
  }

  protected getDishImageUrl(picture: string | undefined): string {
    const base = this.staticUrl.replace(/\/+$/, '');
    const normalizedPicture = (picture || '/image/menu/dishes/unknown.jpg').replace(
      /^\/+/,
      '',
    );
    return `${base}/${normalizedPicture}`;
  }

  protected deleteDish(): void {
    const currentDish = this.dish();
    if (!currentDish || this.isDeleting()) {
      return;
    }

    const confirmed = confirm('Вы уверены, что хотите удалить это блюдо?');
    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.errorText.set(null);

    this.menuService
      .deleteDish$(currentDish._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.router.navigate(['/menu']);
        },
        error: (error) => {
          this.errorText.set(error?.error?.error || 'Ошибка при удалении блюда');
          this.isDeleting.set(false);
        },
      });
  }

  private loadDish(dishId: string): void {
    this.isLoading.set(true);
    this.errorText.set(null);

    this.menuService
      .getDishById$(dishId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dish) => {
          this.dish.set(dish);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorText.set(error?.error?.error || 'Ошибка загрузки блюда');
          this.isLoading.set(false);
        },
      });
  }
}
