import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserDataService } from '../../services/auth/user-data.service';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, ButtonComponent, CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly userDataService = inject(UserDataService);

  protected readonly isAdmin = computed(() => {
    const userData = this.userDataService.getUserData();
    return userData?.role === 'admin';
  });
}
