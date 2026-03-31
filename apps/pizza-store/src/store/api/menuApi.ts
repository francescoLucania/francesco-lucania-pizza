import { baseApi } from './baseApi';
import type {
  Category,
  Dish,
  DishesResponse,
  GetDishesParams,
  GetDishesByCategoryParams,
} from '@francesco-lucania-pizza-models';

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/menu/categories',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Menu' as const, id: _id })),
              { type: 'Menu', id: 'LIST' },
            ]
          : [{ type: 'Menu', id: 'LIST' }],
    }),
    getCategoryById: builder.query<Category, string>({
      query: (id) => `/menu/category/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Menu', id }],
    }),
    getDishes: builder.query<DishesResponse, GetDishesParams | void>({
      query: (params) => ({
        url: '/menu/dishes',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.dishes.map(({ _id }) => ({
                type: 'Menu' as const,
                id: _id,
              })),
              { type: 'Menu', id: 'DISHES' },
            ]
          : [{ type: 'Menu', id: 'DISHES' }],
    }),
    getDishesByCategory: builder.query<
      DishesResponse,
      GetDishesByCategoryParams
    >({
      query: (params) => ({
        url: '/menu/dishes/category',
        params,
      }),
      providesTags: (result, _error, { categoryName }) =>
        result
          ? [
              ...result.dishes.map(({ _id }) => ({
                type: 'Menu' as const,
                id: _id,
              })),
              { type: 'Menu', id: `CATEGORY-${categoryName}` },
            ]
          : [{ type: 'Menu', id: `CATEGORY-${categoryName}` }],
    }),
    getDishById: builder.query<Dish, string>({
      query: (id) => `/menu/dish/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Menu', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetDishesQuery,
  useGetDishesByCategoryQuery,
  useGetDishByIdQuery,
} = menuApi;
