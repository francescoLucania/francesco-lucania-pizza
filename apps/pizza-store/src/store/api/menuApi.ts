import { baseApi } from './baseApi';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenu: builder.query<MenuItem[], void>({
      query: () => '/menu',
      providesTags: ['Menu'],
    }),
    getMenuItem: builder.query<MenuItem, string>({
      query: (id: string) => `/menu/${id}`,
      providesTags: (_result, _error, id: string) => [{ type: 'Menu', id }],
    }),
  }),
});

export const { useGetMenuQuery, useGetMenuItemQuery } = menuApi;
