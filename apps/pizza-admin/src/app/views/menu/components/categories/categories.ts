import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
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
  InputComponent,
  ButtonComponent,
} from '@francesco-lucania-pizza/angular-ui';
import { ApiService } from '../../../../services/api/api.service';
import { CommonModule } from '@angular/common';

interface CategoryForm {
  name: string;
  description: string;
  list: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
  list: string[];
}

interface Dish {
  _id: string;
  name: string;
  fullName: string;
}

@Component({
  selector: 'app-categories',
  imports: [
    FormsModule,
    FormField,
    InputComponent,
    ButtonComponent,
    CommonModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorText = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly dishes = signal<Dish[]>([]);
  protected readonly editingCategoryId = signal<string | null>(null);
  protected readonly isDeleting = signal<string | null>(null);
  protected readonly dishIdInput = signal<string>('');

  protected readonly categoryModel = signal<CategoryForm>({
    name: '',
    description: '',
    list: [],
  });

  protected readonly categoryForm = form(this.categoryModel, (schema) => {
    required(schema.name);
    required(schema.description);
  });

  protected readonly touchedFields = signal<Set<string>>(new Set());

  public ngOnInit(): void {
    this.loadCategories();
    this.loadDishes();
  }

  protected markFieldTouched(fieldName: string): void {
    this.touchedFields.update((fields) => {
      const newFields = new Set(fields);
      newFields.add(fieldName);
      return newFields;
    });
  }

  protected shouldShowError(
    fieldName: string,
    fieldFn: () => FieldState<unknown>,
  ): boolean {
    const fieldState = fieldFn();
    return (
      (this.submitted() || this.touchedFields().has(fieldName)) &&
      fieldState.invalid()
    );
  }

  protected getErrorMessage(errors: readonly ValidationError[]): string {
    if (!errors || errors.length === 0) {
      return '';
    }

    const firstError = errors[0];
    const errorKind = firstError.kind || '';

    if (firstError.message) {
      return firstError.message;
    }

    const errorMessages: Record<string, string> = {
      required: 'Это поле обязательно для заполнения',
    };

    return errorMessages[errorKind] || 'Ошибка валидации';
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.apiService
      .get<Category[]>('/menu/categories')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorText.set(
            error?.error?.error || 'Ошибка при загрузке категорий',
          );
        },
      });
  }

  protected loadDishes(): void {
    this.apiService
      .get<{ dishes: Dish[]; total: number }>('/menu/dishes')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dishes.set(response.dishes);
        },
        error: (error) => {
          console.error('Ошибка при загрузке блюд:', error);
        },
      });
  }

  protected toggleDishInList(dishId: string): void {
    this.categoryModel.update((model) => {
      const list = [...model.list];
      const index = list.indexOf(dishId);
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(dishId);
      }
      return { ...model, list };
    });
  }

  protected isDishSelected(dishId: string): boolean {
    return this.categoryModel().list.includes(dishId);
  }

  protected startEdit(category: Category): void {
    this.editingCategoryId.set(category._id);
    this.categoryModel.set({
      name: category.name,
      description: category.description,
      list: category.list || [],
    });
    this.errorText.set(null);
    this.successMessage.set(null);
    this.submitted.set(false);
    this.touchedFields.set(new Set());
  }

  protected cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.categoryModel.set({
      name: '',
      description: '',
      list: [],
    });
    this.dishIdInput.set('');
    this.errorText.set(null);
    this.successMessage.set(null);
    this.submitted.set(false);
    this.touchedFields.set(new Set());
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorText.set(null);
    this.successMessage.set(null);

    if (!this.categoryForm().valid()) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.categoryModel();
    const categoryId = this.editingCategoryId();

    const request$ = categoryId
      ? this.apiService.put(`/menu/category/${categoryId}`, formValue)
      : this.apiService.post('/menu/category', formValue);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          categoryId
            ? 'Категория успешно обновлена!'
            : 'Категория успешно создана!',
        );
        this.loadCategories();
        setTimeout(() => {
          this.cancelEdit();
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorText.set(
          error?.error?.error ||
            `Произошла ошибка при ${categoryId ? 'обновлении' : 'создании'} категории`,
        );
      },
    });
  }

  protected deleteCategory(categoryId: string): void {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    this.isDeleting.set(categoryId);
    this.apiService
      .delete(`/menu/category/${categoryId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(null);
          this.successMessage.set('Категория успешно удалена!');
          this.loadCategories();
          setTimeout(() => {
            this.successMessage.set(null);
          }, 2000);
        },
        error: (error) => {
          this.isDeleting.set(null);
          this.errorText.set(
            error?.error?.error || 'Ошибка при удалении категории',
          );
        },
      });
  }

  protected getDishName(dishId: string): string {
    const dish = this.dishes().find((d) => d._id === dishId);
    return dish ? dish.name || dish.fullName : dishId;
  }

  protected copyDishIdToInput(dishId: string): void {
    this.dishIdInput.set(dishId);
  }

  protected addDishById(): void {
    const dishId = this.dishIdInput().trim();
    if (!dishId) {
      return;
    }

    // Проверяем, существует ли блюдо
    const dishExists = this.dishes().some((d) => d._id === dishId);
    if (!dishExists) {
      this.errorText.set('Блюдо с таким ID не найдено');
      return;
    }

    // Проверяем, не добавлено ли уже это блюдо
    if (this.categoryModel().list.includes(dishId)) {
      this.errorText.set('Это блюдо уже добавлено в категорию');
      return;
    }

    // Добавляем блюдо в список
    this.categoryModel.update((model) => ({
      ...model,
      list: [...model.list, dishId],
    }));

    // Очищаем инпут
    this.dishIdInput.set('');
    this.errorText.set(null);
  }

  protected removeDishFromList(dishId: string): void {
    this.categoryModel.update((model) => {
      const list = model.list.filter((id) => id !== dishId);
      return { ...model, list };
    });
  }
}
