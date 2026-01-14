import { Component, Input } from '@angular/core';
import { INavigateList } from './models/navigate/navigate';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigateListActiveRouteDisableDirective } from './directives/navigate-list-active-route-disable/navigate-list-active-route-disable.directive';
import { NgClass } from '@angular/common';

@Component({
  selector: 'neo-ui-navigate-list',
  templateUrl: './navigate-list.component.html',
  styleUrls: ['./navigate-list.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NavigateListActiveRouteDisableDirective,
    NgClass,
  ],
})
export class NavigateListComponent {
  @Input() public navigate: INavigateList[] = [];
  @Input() public type: 'vertical' | 'horizontal' = 'horizontal';
}
