import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  // In production, prefer same-origin reverse proxy (/api) over localhost fallback.
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  credentials: 'include', // Включаем отправку cookies
  prepareHeaders: (headers: Headers) => {
    // Add auth token if available
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  baseQuery,
  tagTypes: ['Menu', 'Order', 'User'],
  endpoints: () => ({}),
});
