'use client';

import {
  useGetCategoriesQuery,
  useGetDishesByCategoryQuery,
} from '../../../store/api/menuApi';
import type { Category } from '@francesco-lucania-pizza-models';
import { ProductCard } from '../ProductCard/ProductCard';
import styles from './MenuContent.module.scss';

function CategorySection({ category }: { category: Category }) {
  const { data, isLoading } = useGetDishesByCategoryQuery({
    categoryName: category.name,
  });
  const dishes = data?.dishes ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>{category.name}:</h2>
        {category.description && (
          <p className={styles.categoryDescription}>{category.description}</p>
        )}
        {isLoading ? (
          <div className={styles.loading}>Загрузка блюд...</div>
        ) : dishes.length === 0 ? (
          <div className={styles.empty}>В этой категории пока нет блюд</div>
        ) : (
          <div className={styles.dishesGrid}>
            {dishes.map((dish) => (
              <ProductCard key={dish._id} dish={dish} />
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
      <div className={styles.wrapper}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.loading}>Загрузка меню...</div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.error}>
              Не удалось загрузить меню. Попробуйте обновить страницу.
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className={styles.wrapper}>
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.empty}>Меню пока пусто</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => (
        <CategorySection key={category._id} category={category} />
      ))}
    </div>
  );
}
