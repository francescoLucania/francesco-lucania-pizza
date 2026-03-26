'use client';

import type { Dish } from '@francesco-lucania-pizza-models';
import { PizzaReactButton } from '@francesco-lucania-pizza/react-ui';
import styles from './ProductCard.module.scss';

const staticBaseUrl =
  process.env.NEXT_PUBLIC_STATIC_URL ||
  (typeof window !== 'undefined'
    ? ''
    : process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:5000');

function getDishImageUrl(picture: string | undefined): string {
  if (!picture) {
    return `${staticBaseUrl}/image/menu/dishes/unknown.jpg`;
  }
  return `${staticBaseUrl}/${picture}`;
}

export type ProductCardProps = {
  dish: Dish;
};

export function ProductCard({ dish }: ProductCardProps) {
  const name = dish.name || dish.fullName;
  const detailHref = `/dishes/${dish._id}`;

  return (
    <article className={styles.card}>
      {dish.picture && (
        <div className={styles.image}>
          <img src={getDishImageUrl(dish.picture)} alt={name} />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        {dish.description && (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: dish.description }}
          />
        )}
      </div>
      <div className={styles.actions}>
        <PizzaReactButton
          label="Подробнее"
          fullWidth={true}
          link={detailHref}
        />
      </div>
    </article>
  );
}
