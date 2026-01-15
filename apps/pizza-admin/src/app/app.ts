import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import {
  FooterComponent,
  HeaderComponent,
  INavigateList,
  ModalComponent,
  PopoverComponent
} from "@francesco-lucania-pizza/angular-ui";

@Component({
  imports: [NxWelcome, RouterModule, HeaderComponent, FooterComponent, ModalComponent, PopoverComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public navigate: INavigateList[] = [
    { name: 'Главная', uri: '' },
    { name: 'Меню', uri: 'styles/global' },
    { name: 'Заказы', uri: 'components' },
    { name: 'Пользователи', uri: 'accessibility' },
    { name: 'Контакты', uri: 'Contacts' },
  ];
}
