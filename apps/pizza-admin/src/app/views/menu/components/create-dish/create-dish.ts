import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import type { CreateDishDto } from '@francesco-lucania-pizza-models';
import { MenuService } from '../../services/menu.service';

interface CreateDishForm {
  name: string;
  fullName: string;
  description: string;
  ingredients: string;
  recipe: string;
  isActive: boolean;
  picture: File | null;
}

@Component({
  selector: 'app-create-dish',
  imports: [FormsModule, FormField, InputComponent, ButtonComponent],
  templateUrl: './create-dish.html',
  styleUrl: './create-dish.scss',
})
export class CreateDish implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorText = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly dishId = signal<string | null>(null);
  protected readonly isEditMode = computed(() => !!this.dishId());

  protected readonly dishModel = signal<CreateDishForm>({
    name: '',
    fullName: '',
    description: '',
    ingredients: '',
    recipe: '',
    isActive: false,
    picture: null,
  });

  protected readonly dishForm = form(this.dishModel, (schema) => {
    required(schema.name);
    required(schema.fullName);
    required(schema.description);
    required(schema.ingredients);
    required(schema.recipe);
  });

  protected readonly touchedFields = signal<Set<string>>(new Set());

  public ngOnInit(): void {
    const dishId = this.route.snapshot.paramMap.get('id');
    if (!dishId) {
      return;
    }

    this.dishId.set(dishId);
    this.loadDishForEdit(dishId);
  }

  private loadDishForEdit(dishId: string): void {
    this.isLoading.set(true);
    this.menuService
      .getDishById$(dishId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dish) => {
          this.dishModel.set({
            name: dish.name || '',
            fullName: dish.fullName || '',
            description: dish.description || '',
            ingredients: dish.ingredients || '',
            recipe: dish.recipe || '',
            isActive: dish.isActive || false,
            picture: null,
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorText.set(
            error?.error?.error || 'Не удалось загрузить блюдо для редактирования',
          );
        },
      });
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

  protected onPictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.dishModel.update((model) => ({
      ...model,
      picture: file,
    }));
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorText.set(null);
    this.successMessage.set(null);

    if (!this.dishForm().valid()) {
      return;
    }

    this.isLoading.set(true);
    const formValue = this.dishModel();

    const createData: CreateDishDto = {
      name: formValue.name,
      fullName: formValue.fullName,
      description: formValue.description,
      ingredients: formValue.ingredients,
      recipe: formValue.recipe,
      isActive: formValue.isActive,
    };

    const updateData: Partial<CreateDishDto> = createData;

    const request$ = this.isEditMode()
      ? formValue.picture
        ? this.menuService.updateDishWithImage$(this.dishId()!, updateData, formValue.picture)
        : this.menuService.updateDish$(this.dishId()!, updateData)
      : formValue.picture
        ? this.menuService.createDishWithImage$(createData, formValue.picture)
        : this.menuService.createDish$(createData);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          this.isEditMode() ? 'Блюдо успешно обновлено!' : 'Блюдо успешно создано!',
        );
        setTimeout(() => {
          this.router.navigate(['/menu']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorText.set(
          error?.error?.error ||
            (this.isEditMode()
              ? 'Произошла ошибка при обновлении блюда'
              : 'Произошла ошибка при создании блюда'),
        );
      },
    });
  }
}
