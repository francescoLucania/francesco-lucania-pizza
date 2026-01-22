import * as React from 'react';
import { NavigateListLink } from './navigate-list-link';
import styles from './navigate-list.module.scss';

export interface INavigateList {
  name: string;
  uri: string;
}

export type NavigateListProps = {
  navigate: INavigateList[];
  type?: 'vertical' | 'horizontal';
  useNextLink?: boolean;
  activePath?: string;
};

export const NavigateList: React.FC<NavigateListProps> = ({
  navigate = [],
  type = 'horizontal',
  useNextLink = false,
  activePath,
}) => {
  const listClassName = [
    styles['navigate-list'],
    type === 'vertical' ? styles['navigate-list--vertical'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ol className={listClassName}>
      {navigate.map((item, index) => {
        const isActive = activePath === item.uri;
        const linkClassName = [
          styles['focus-visible'],
          isActive ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={index} className={styles['navigate-list__item']}>
            <NavigateListLink
              href={item.uri}
              className={linkClassName}
              useNextLink={useNextLink}
            >
              <span>{item.name}</span>
            </NavigateListLink>
          </li>
        );
      })}
    </ol>
  );
};

export default NavigateList;
