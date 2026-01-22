'use client';

import * as React from 'react';
import { NavigateList, INavigateList } from '../navigate-list/navigate-list';
import styles from './header.module.scss';

export type HeaderMobileMenuProps = {
  navigate: INavigateList[];
  useNextLink?: boolean;
  activePath?: string;
};

export function HeaderMobileMenu({
  navigate,
  useNextLink = false,
  activePath,
}: HeaderMobileMenuProps) {
  const [mobileMenuState, setMobileMenuState] = React.useState(false);
  const [mobileMenuStateClose, setMobileMenuStateClose] = React.useState(false);
  const [pathname, setPathname] = React.useState<string | null>(
    activePath ||
      (typeof window !== 'undefined' ? window.location.pathname : null),
  );

  // Update pathname when activePath changes or on navigation
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (activePath !== undefined) {
      setPathname(activePath);
      return;
    }

    setPathname(window.location.pathname);

    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        setPathname(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleLocationChange);
      }
    };
  }, [activePath]);

  // Close menu when pathname changes
  React.useEffect(() => {
    if (pathname) {
      setMobileMenuState(false);
    }
  }, [pathname]);

  const changeMenu = (userEvent = true) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!userEvent) {
      setMobileMenuState(false);
      return;
    }

    if (mobileMenuState) {
      setMobileMenuStateClose(true);
      setTimeout(() => {
        setMobileMenuState(false);
        setMobileMenuStateClose(false);
      }, 1200);
    } else {
      setMobileMenuState(true);
    }
  };

  const menuButtonClassName = [
    styles['menu-button'],
    mobileMenuState ? styles['menu-button--is-active'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mobileMenuFadeClassName = [
    styles['mobile-menu-fade'],
    mobileMenuState ? styles['is-active'] : '',
    mobileMenuStateClose ? styles['is-close'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mobileMenuClassName = [
    styles['mobile-menu'],
    mobileMenuState ? styles['is-active'] : '',
    mobileMenuStateClose ? styles['is-close'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        onClick={() => changeMenu()}
        type="button"
        aria-label="Меню"
        className={menuButtonClassName}
      >
        <span></span>
      </button>

      <div
        className={mobileMenuFadeClassName}
        onClick={() => changeMenu()}
      ></div>

      <div className={mobileMenuClassName}>
        <div className={styles['mobile-menu__box']}>
          <NavigateList
            navigate={navigate}
            type="vertical"
            useNextLink={useNextLink}
            activePath={pathname || undefined}
          />
        </div>
      </div>
    </>
  );
}
