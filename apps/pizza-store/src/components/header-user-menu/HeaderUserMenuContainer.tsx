'use client';

import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import styles from './HeaderUserMenu.module.scss';

export type HeaderUserMenuProps = {
  useNextLink?: boolean;
  activePath?: string;
};

export const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  useNextLink = false,
  activePath,
}) => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const [LinkComponent, setLinkComponent] = React.useState<React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }> | null>(null);

  const href = isAuthenticated ? '/profile' : '/login';
  const label = isAuthenticated ? 'Профиль' : 'Войти';
  const isActive = activePath === href;

  const linkClassName = [styles['focus-visible'], isActive ? 'is-active' : '']
    .filter(Boolean)
    .join(' ');

  React.useEffect(() => {
    if (useNextLink) {
      // Dynamic import for Next.js Link
      import('next/link')
        .then((module) => {
          setLinkComponent(() => module.default);
        })
        .catch(() => {
          // Next.js not available
          setLinkComponent(null);
        });
    }
  }, [useNextLink]);

  const linkContent = (
    <>
      {LinkComponent ? (
        <LinkComponent href={href} className={linkClassName}>
          <span>{label}</span>
        </LinkComponent>
      ) : (
        <a href={href} className={linkClassName}>
          <span>{label}</span>
        </a>
      )}
    </>
  );

  return <li className={styles['header-user-menu']}>{linkContent}</li>;
};

export default HeaderUserMenu;
