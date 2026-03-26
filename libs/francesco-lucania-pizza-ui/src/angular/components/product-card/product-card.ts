import { Component, input } from '@angular/core';
import { ButtonComponent } from "@francesco-lucania-pizza/angular-ui";
import {NgClass} from "@angular/common";

@Component({
  selector: 'pizza-lib-product-card',
  imports: [
    ButtonComponent,
    NgClass
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  public title = input<string | undefined>(undefined);
  public image = input<string | undefined>(undefined);
  public description = input<string | undefined>(undefined);
  public moreLink = input<string | undefined>(undefined);

}
