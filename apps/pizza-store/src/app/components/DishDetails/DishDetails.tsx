'use client';

import { useGetDishByIdQuery } from '../../../store/api/menuApi';
import styles from './DishDetails.module.scss';

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

type DishDetailsProps = {
  dishId: string;
};

type HtmlTextBlockProps = {
  value?: string;
};

function HtmlTextBlock({ value }: HtmlTextBlockProps) {
  if (!value) {
    return <p className={styles['pizza-ui-dish-details__text']}>-</p>;
  }

  return (
    <div
      className={styles['pizza-ui-dish-details__text']}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

export function DishDetails({ dishId }: DishDetailsProps) {
  const {
    data: dish,
    isLoading,
    error,
  } = useGetDishByIdQuery(dishId, {
    skip: !dishId,
  });

  const errorText =
    'status' in (error || {})
      ? 'Не удалось загрузить блюдо. Попробуйте обновить страницу.'
      : null;

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <div className={styles['pizza-ui-dish-details']}>
            <p className={styles['pizza-ui-dish-details__state']}>
              Загрузка блюда...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (errorText || !dish) {
    return (
      <section className="section">
        <div className="container">
          <div className={styles['pizza-ui-dish-details']}>
            <div className={styles['pizza-ui-dish-details__error']}>
              {errorText || 'Блюдо не найдено'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const dishName = dish.name || dish.fullName;

  return (
    <section className="section">
      <div className="container">
        <div className={styles['pizza-ui-dish-details']}>
          <h1 className="heading-h1">{dishName}</h1>

          <div
            className={`${styles['pizza-ui-dish-details__image-wrap']} mt-24`}
          >
            <img
              className={styles['pizza-ui-dish-details__image']}
              src={getDishImageUrl(dish.picture)}
              alt={dishName}
            />
          </div>

          <div className={`${styles['pizza-ui-dish-details__content']} mt-24`}>
            <h3 className="heading-h3">Полное название</h3>
            <p className={`${styles['pizza-ui-dish-details__text']} mt-8`}>
              {dish.fullName || '-'}
            </p>

            <h3 className="heading-h3 mt-24">Описание</h3>
            <div className="mt-8">
              <HtmlTextBlock value={dish.description} />
            </div>

            <h3 className="heading-h3 mt-24">Ингредиенты</h3>
            <div className="mt-8">
              <HtmlTextBlock value={dish.ingredients} />
            </div>

            {dish.recipe && (
              <>
                <h3 className="heading-h3 mt-24">Рецепт</h3>
                <div className="mt-8">
                  <HtmlTextBlock value={dish.recipe} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
