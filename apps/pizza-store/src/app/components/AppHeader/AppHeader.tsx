'use client';

import { Header, INavigateList } from '@francesco-lucania-pizza/react-ui';
import HeaderUserMenu from '../HeaderUserMenu/HeaderUserMenu';

const navigationItems: INavigateList[] = [
  { name: 'Главная', uri: '/' },
  { name: 'Меню', uri: '/menu' },
  { name: 'Заказать', uri: '/order' },
  { name: 'Контакты', uri: '/contacts' },
];

export function AppHeader() {
  return (
    <Header
      navigate={navigationItems}
      logoPath="/img/logo.jpg"
      useNextLink={true}
    >
      <HeaderUserMenu useNextLink={true} />
    </Header>
  );
}
