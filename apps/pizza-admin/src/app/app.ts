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
import {PlatformService} from "./services/platform/platform.service";

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
  private readonly platformService = inject(PlatformService);


  public readonly navigate
    = computed<INavigateList[]>(() => {
    const base: INavigateList[] = [
      { name: 'Главная', uri: '' },
      { name: 'Меню', uri: 'menu' },
      { name: 'Заказы', uri: 'components' },
      { name: 'Пользователи', uri: 'accessibility' },
      { name: 'Контакты', uri: 'Contacts' },
    ];

    if (!this.platformService.isBrowser() || this.session.isAuthenticated() === undefined) {
      return [...base]
    }

    const authItem: INavigateList = this.session.isAuthenticated()
      ? { name: 'Профиль', uri: 'profile' }
      : { name: 'Войти', uri: 'login' };

    return [...base, authItem];
  });
}
