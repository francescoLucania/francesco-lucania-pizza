import {Component, computed, effect, inject} from '@angular/core';
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
import {toSignal} from "@angular/core/rxjs-interop";
import {UserDataService} from "./services/auth";

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
  private readonly userDataService = inject(UserDataService);
  private readonly platformService = inject(PlatformService);

  private userData = toSignal(
    this.userDataService.userData$
  );


  public readonly navigate = computed<INavigateList[]>(() => {
    const base: INavigateList[] = [
      { name: 'Главная', uri: '' },
      { name: 'Меню', uri: 'menu' },
      { name: 'Заказы', uri: 'components' },
      { name: 'Пользователи', uri: 'accessibility' },
      { name: 'Контакты', uri: 'Contacts' },
    ];

    // Сначала обращаемся ко всем сигналам
    const userDataValue = this.userData();
    const isAuthenticated = this.session.isAuthenticated();

    // Теперь все сигналы отслеживаются
    console.log('userDataValue', userDataValue);
    console.log('isAuthenticated', isAuthenticated);


    // Проверяем условия после обращения к сигналам
    if (
      !this.platformService.isBrowser() ||
      isAuthenticated === undefined) {
      return [...base];
    }

    const authItem: INavigateList = isAuthenticated
      ? { name: 'Профиль', uri: 'profile' }
      : { name: 'Войти', uri: 'login' };

    return [...base, authItem];
  });
}
