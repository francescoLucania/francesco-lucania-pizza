import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'neo-ui-button',
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
  @Input() public theme: 'base' | 'secondary' | 'brand' = 'base';
  @Input() public size: 'base' | 'small' | 'large' = 'base';
  @Input() public fullWidth = false;
  @Input() public showLoader = false;

  @Input() public disabled = false;
  @Input() public buttonType: 'submit' | 'reset' | 'button' = 'button';

  @Input() public link = '';
  @Input() public target: '_blank' | '_self' | '_parent' | '_top' = '_self';

  public title = input<string | undefined>(undefined);
  public ariaLabel = input<string | undefined>(undefined);
  public tabIndex = input<string | undefined>(undefined);
}
