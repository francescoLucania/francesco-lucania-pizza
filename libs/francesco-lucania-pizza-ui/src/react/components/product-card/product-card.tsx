import * as React from 'react';
import { PizzaReactButton } from '../button/button';
import styles from './product-card.module.scss';

export type ProductCardProps = {
  title?: string;
  image?: string;
  description?: React.ReactNode;
  moreLink?: string;
  children?: React.ReactNode;
};

export const PizzaReactProductCard: React.FC<ProductCardProps> = ({
  title,
  image,
  description,
  moreLink,
  children,
}) => {
  const className = [
    styles['product-card'],
    moreLink ? styles['product-card--link'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className} tabIndex={0}>
      <header className={styles['product-card__header']}>
        {image && (
          <div className={styles['product-card__image']}>
            <img src={image} alt={title || ''} aria-hidden="true" />
          </div>
        )}
        {title && (
          <h3 className={`${styles['product-card__title']} mt-16 heading-h3`}>
            {title}
          </h3>
        )}
      </header>

      <div className={styles['product-card__body']}>
        {description && (
          <div className={styles['product-card__description']}>
            {description}
          </div>
        )}
      </div>

      <footer className={styles['product-card__footer']}>
        {moreLink && (
          <>
            <div>
              <PizzaReactButton
                size="large"
                fullWidth={true}
                link={moreLink}
                label="Подробнее"
              />
            </div>
            <div>{children}</div>
          </>
        )}
      </footer>
    </article>
  );
};
