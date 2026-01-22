import * as React from 'react';
import { NavigateList, INavigateList } from '../navigate-list/navigate-list';
import { HeaderScrollHandler } from './header-scroll-handler';
import { HeaderMobileMenu } from './header-mobile-menu';
import { HeaderLink } from './header-link';
import styles from './header.module.scss';

export type HeaderProps = {
  navigate?: INavigateList[];
  logoPath?: string;
  useNextLink?: boolean;
  activePath?: string;
};

export const Header: React.FC<HeaderProps> = ({
  navigate = [],
  logoPath = '../../assets/img/logo.jpg',
  useNextLink = false,
  activePath,
}) => (
  <header className={styles['site-header']}>
    <HeaderScrollHandler />
    <div className={styles.container}>
      <div className={styles['site-header__grid']}>
        <HeaderLink
          href="/"
          className={styles['site-header__logo']}
          useNextLink={useNextLink}
        >
          <img src={logoPath} alt="" />
        </HeaderLink>

        <nav
          tabIndex={0}
          role="navigation"
          className={styles['site-header__navigate']}
        >
          <NavigateList
            navigate={navigate}
            useNextLink={useNextLink}
            activePath={activePath}
          />
        </nav>

        <HeaderMobileMenu
          navigate={navigate}
          useNextLink={useNextLink}
          activePath={activePath}
        />
      </div>
    </div>
  </header>
);

export default Header;
