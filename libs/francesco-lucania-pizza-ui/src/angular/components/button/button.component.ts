import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'pizza-lib-button',
  templateUrl: './button.component.html',
  styleUrls: [
    '../../../../assets/styles/theme-provider/lib-components/button/button.component.scss',
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet],
})
export class ButtonComponent {
  public label = input<string | undefined>(undefined);
  public theme = input<'base' | 'secondary' | 'brand'>('base');
  public size = input<'base' | 'small' | 'large'>('base');
  public fullWidth = input<boolean>(false);
  public showLoader = input<boolean>(false);

  public disabled = input<boolean>(false);
  public buttonType = input<'submit' | 'reset' | 'button'>('button');

  public link = input<string>('');
  public target = input<'_blank' | '_self' | '_parent' | '_top'>('_self');

  public title = input<string | undefined>(undefined);
  public ariaLabel = input<string | undefined>(undefined);
  public tabIndex = input<string | undefined>(undefined);
}
