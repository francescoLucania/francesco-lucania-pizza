# Redux Toolkit Setup для pizza-store

## Установка

```bash
npm install @reduxjs/toolkit react-redux
```

## Структура

```
src/store/
├── store.ts          # Конфигурация store
├── hooks.ts          # Типизированные хуки
├── provider.tsx      # Redux Provider для Next.js
├── index.ts          # Экспорты
├── slices/
│   └── cartSlice.ts  # Слайс корзины
└── api/
    ├── baseApi.ts    # Базовый RTK Query API
    └── menuApi.ts    # API для меню
```

## Использование

### В компонентах

```tsx
'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addItem, removeItem } from '@/store/slices/cartSlice';

export function MyComponent() {
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const handleAdd = () => {
    dispatch(addItem({ id: '1', name: 'Пицца', price: 500 }));
  };

  return <div>...</div>;
}
```

### RTK Query для API

```tsx
'use client';

import { useGetCategoriesQuery, useGetDishesByCategoryQuery } from '@/store/api/menuApi';

export function MenuComponent() {
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: dishesData, isLoading: dishesLoading } = useGetDishesByCategoryQuery({
    categoryName: 'Пицца',
  });

  if (categoriesLoading || dishesLoading) return <div>Загрузка...</div>;

  return <div>{/* Рендер меню по категориям и блюдам */}</div>;
}
```

## Добавление новых слайсов

1. Создайте файл в `src/store/slices/`
2. Импортируйте в `store.ts`
3. Добавьте в `reducer`

## Добавление новых API endpoints

1. Создайте файл в `src/store/api/`
2. Используйте `baseApi.injectEndpoints()`
3. Экспортируйте хуки

## Переменные окружения

Создайте `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
