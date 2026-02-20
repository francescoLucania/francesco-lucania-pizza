import { inject, Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, tap} from 'rxjs';
import { ApiService, FileUploadOptions } from '../../../services/api/api.service';
import type {
  Category,
  Dish,
  DishesResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateDishDto,
  GetDishesParams,
  GetDishesByCategoryParams,
} from '@francesco-lucania-pizza-models';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly apiService = inject(ApiService);

  /**
   * BehaviorSubject для хранения результатов getDishesByCategory по categoryName
   */
  private readonly dishesByCategorySubject$ = new BehaviorSubject<
    Record<string, DishesResponse>
  >({});

  /**
   * Observable для подписки на изменения dishesByCategory
   */
  public readonly dishesByCategory$ = this.dishesByCategorySubject$.asObservable();

  /**
   * BehaviorSubject для хранения списка категорий
   */
  private readonly categoriesSubject$ = new BehaviorSubject<Category[] | null>(null);

  /**
   * Observable для подписки на изменения categories
   */
  public readonly categories$ = this.categoriesSubject$.asObservable();

  /**
   * Получает все категории
   */
  public getCategories$(): Observable<Category[]> {
    const loadedCategories = this.categoriesSubject$.getValue();

    if (loadedCategories) {
      return of(loadedCategories);
    }

    return this.apiService.get<Category[]>('/menu/categories').pipe(
      tap((response) => {
        this.categoriesSubject$.next(response);
      }),
    );
  }

  /**
   * Получает категорию по ID
   */
  public getCategoryById$(id: string): Observable<Category> {
    return this.apiService.get<Category>(`/menu/category/${id}`);
  }

  /**
   * Создает новую категорию
   */
  public createCategory$(data: CreateCategoryDto): Observable<Category> {
    return this.apiService.post<Category>('/menu/category', data);
  }

  /**
   * Обновляет категорию
   */
  public updateCategory$(
    id: string,
    data: UpdateCategoryDto,
  ): Observable<Category> {
    return this.apiService.put<Category>(`/menu/category/${id}`, data);
  }

  /**
   * Удаляет категорию
   */
  public deleteCategory$(id: string): Observable<void> {
    return this.apiService.delete<void>(`/menu/category/${id}`);
  }

  /**
   * Получает все блюда с пагинацией
   */
  public getDishes$(params?: GetDishesParams): Observable<DishesResponse> {
    const queryParams: { [key: string]: any } = {};
    if (params?.limit !== undefined) {
      queryParams['limit'] = params.limit;
    }
    if (params?.skip !== undefined) {
      queryParams['skip'] = params.skip;
    }

    return this.apiService.get<DishesResponse>('/menu/dishes', {
      params: queryParams,
    });
  }

  /**
   * Получает блюда по названию категории с пагинацией
   */
  public getDishesByCategory$(
    params: GetDishesByCategoryParams,
  ): Observable<DishesResponse> {

    const loadedDishes = this.dishesByCategorySubject$.getValue()[params.categoryName];

    if (loadedDishes) {
      return of(loadedDishes);
    }

    const queryParams: { [key: string]: any } = {
      categoryName: params.categoryName,
    };
    if (params.limit !== undefined) {
      queryParams['limit'] = params.limit;
    }
    if (params.skip !== undefined) {
      queryParams['skip'] = params.skip;
    }

    return this.apiService.get<DishesResponse>('/menu/dishes/category', {
      params: queryParams,
    }).pipe(
      tap((response) => {
        const currentValue = this.dishesByCategorySubject$.value;
        this.dishesByCategorySubject$.next({
          ...currentValue,
          [params.categoryName]: response,
        });
      }),
    );
  }

  /**
   * Создает новое блюдо
   */
  public createDish$(data: CreateDishDto): Observable<Dish> {
    return this.apiService.post<Dish>('/menu/create', data);
  }

  /**
   * Создает новое блюдо с загрузкой изображения
   */
  public createDishWithImage$(
    data: CreateDishDto,
    picture: File,
  ): Observable<Dish> {
    const uploadOptions: FileUploadOptions = {
      file: picture,
      fieldName: 'picture',
      additionalData: data,
    };
    return this.apiService.uploadFile<Dish>('/menu/create', uploadOptions);
  }
}
