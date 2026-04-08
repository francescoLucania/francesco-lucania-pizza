'use client';

import {
  useGetCategoriesQuery,
  useGetDishesByCategoryQuery,
} from '../../../store/api/menuApi';
import type { Category } from '@francesco-lucania-pizza-models';
import { PizzaReactProductCard } from '@francesco-lucania-pizza/react-ui';
import styles from './MenuContent.module.scss';

const staticBaseUrl =
  process.env.NEXT_PUBLIC_STATIC_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/static'
    : '/static');

function getDishImageUrl(picture: string | undefined): string {
  const base = staticBaseUrl.replace(/\/+$/, '');
  const normalizedPicture = (
    picture || '/image/menu/dishes/unknown.jpg'
  ).replace(/^\/+/, '');
  if (!picture) {
    return `${base}/${normalizedPicture}`;
  }
  return `${base}/${normalizedPicture}`;
}

function CategorySection({ category }: { category: Category }) {
  const { data, isLoading } = useGetDishesByCategoryQuery({
    categoryName: category.name,
  });
  const dishes = data?.dishes ?? [];

  return (
    <section className={styles['pizza-ui-menu-page__section']}>
      <div className={styles['pizza-ui-menu-page__container']}>
        <h2 className={styles['pizza-ui-menu-page__heading']}>
          {category.name}:
        </h2>
        {category.description && (
          <p className={styles['pizza-ui-menu-page__category-description']}>
            {category.description}
          </p>
        )}
        {isLoading ? (
          <div className={styles['pizza-ui-menu-page__state']}>
            Загрузка блюд...
          </div>
        ) : dishes.length === 0 ? (
          <div className={styles['pizza-ui-menu-page__state']}>
            В этой категории пока нет блюд
          </div>
        ) : (
          <div className={styles['pizza-ui-menu-page__dishes-grid']}>
            {dishes.map((dish) => (
              <PizzaReactProductCard
                key={dish._id}
                title={dish.name || dish.fullName}
                image={dish.picture ? getDishImageUrl(dish.picture) : undefined}
                moreLink={`/dishes/${dish._id}`}
                description={
                  dish.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: dish.description }}
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function MenuContent() {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <div className={styles['pizza-ui-menu-page__wrapper']}>
        <section className={styles['pizza-ui-menu-page__section']}>
          <div className={styles['pizza-ui-menu-page__container']}>
            <div className={styles['pizza-ui-menu-page__state']}>
              Загрузка меню...
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['pizza-ui-menu-page__wrapper']}>
        <section className={styles['pizza-ui-menu-page__section']}>
          <div className={styles['pizza-ui-menu-page__container']}>
            <div
              className={`${styles['pizza-ui-menu-page__state']} ${styles['pizza-ui-menu-page__state--error']}`}
            >
              Не удалось загрузить меню. Попробуйте обновить страницу.
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className={styles['pizza-ui-menu-page__wrapper']}>
        <section className={styles['pizza-ui-menu-page__section']}>
          <div className={styles['pizza-ui-menu-page__container']}>
            <div className={styles['pizza-ui-menu-page__state']}>
              Меню пока пусто
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles['pizza-ui-menu-page__wrapper']}>
      {categories.map((category) => (
        <CategorySection key={category._id} category={category} />
      ))}
    </div>
  );
}
