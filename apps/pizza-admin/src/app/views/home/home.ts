import { Component, inject } from '@angular/core';
import {ButtonComponent, ModalService, OpenModalTemplateRefDirective} from "@francesco-lucania-pizza/angular-ui";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ButtonComponent,
    OpenModalTemplateRefDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public modalService = inject(ModalService)
}
