import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'neo-ui-popover-base-component',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './popover-base-component.component.html',
  styleUrl: './popover-base-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverBaseComponentComponent {
  public content: TemplateRef<any>;
}
