import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FooterComponent,
  HeaderComponent,
  INavigateList,
  ModalComponent,
  PopoverComponent,
} from '@francesco-lucania-pizza/angular-ui';
import { AuthSessionService } from './services/auth/auth-session.service';

@Component({
  imports: [
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ModalComponent,
    PopoverComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly session = inject(AuthSessionService);

  public readonly navigate = computed<INavigateList[]>(() => {
    const base: INavigateList[] = [
      { name: 'Главная', uri: '' },
      { name: 'Меню', uri: 'styles/global' },
      { name: 'Заказы', uri: 'components' },
      { name: 'Пользователи', uri: 'accessibility' },
      { name: 'Контакты', uri: 'Contacts' },
    ];

    const authItem: INavigateList = this.session.isAuthenticated()
      ? { name: 'Профиль', uri: 'profile' }
      : { name: 'Войти', uri: 'login' };

    return [...base, authItem];
  });
}
