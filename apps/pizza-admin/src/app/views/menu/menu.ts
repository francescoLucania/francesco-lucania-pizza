import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDataService } from '../../services/auth/user-data.service';
import {BrowserService, ButtonComponent, ProductCard} from '@francesco-lucania-pizza/angular-ui';
import { CommonModule } from '@angular/common';
import { MenuService } from './services/menu.service';
import type { Category, Dish } from '@francesco-lucania-pizza-models';
import { environment } from '../../../environments/environment';

interface CategoryWithDishes {
  category: Category;
  dishes: Dish[];
  isLoading: boolean;
}

@Component({
  selector: 'app-menu',
  imports: [RouterModule, ButtonComponent, CommonModule, ProductCard],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  private readonly userDataService = inject(UserDataService);
  private readonly menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly browserService = inject(BrowserService);

  protected readonly isAdmin = computed(() => {
    const userData = this.userDataService.getUserData();

    console.log('isAdmin userData', userData)
    return userData?.role === 'admin';
  });

  protected readonly categoriesWithDishes = signal<CategoryWithDishes[]>([]);
  protected readonly isLoadingCategories = signal<boolean>(false);
  protected readonly staticUrl = environment.staticUrl;

  public ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.menuService
      .getCategories$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          const categoriesWithDishes: CategoryWithDishes[] = categories.map((category) => ({
            category,
            dishes: [],
            isLoading: true,
          }));
          this.categoriesWithDishes.set(categoriesWithDishes);
          this.isLoadingCategories.set(false);

          // Загружаем блюда для каждой категории
          categories.forEach((category, index) => {
            this.loadDishesForCategory(category.name, index);
          });
        },
        error: (error) => {
          console.error('Ошибка при загрузке категорий:', error);
          this.isLoadingCategories.set(false);
        },
      });
  }

  protected loadDishesForCategory(categoryName: string, categoryIndex: number): void {
    this.menuService
      .getDishesByCategory$({
        categoryName,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.categoriesWithDishes.update((categories) => {
            const updated = [...categories];
            updated[categoryIndex] = {
              ...updated[categoryIndex],
              dishes: response.dishes,
              isLoading: false,
            };
            return updated;
          });
        },
        error: (error) => {
          console.error(`Ошибка при загрузке блюд категории ${categoryName}:`, error);
          this.categoriesWithDishes.update((categories) => {
            const updated = [...categories];
            updated[categoryIndex] = {
              ...updated[categoryIndex],
              dishes: [],
              isLoading: false,
            };
            return updated;
          });
        },
      });
  }

  protected getDishImageUrl(picture: string | undefined): string {
    const base = this.staticUrl.replace(/\/+$/, '');
    const normalizedPicture = (picture || '/image/menu/dishes/unknown.jpg').replace(
      /^\/+/,
      '',
    );
    return `${base}/${normalizedPicture}`;
  }
}
