import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
} from '@angular/core';
import { PopoverData, PopoverService } from '../../services';
import { PopoverBaseComponentComponent } from '../../components';
import { EMPTY_FUNCTION } from '../../../../constants';

@Directive({
  selector: '[openPizzaLibPopoverFromTemplate]',
  standalone: true,
})
export class PopoverDirective {
  @Input() public openPizzaLibPopoverFromTemplate: TemplateRef<unknown>;
  @Input() public openPizzaLibPopoverTitle: string | null;
  @Input() public openPizzaLibPopoverGutter: string | null;
  @Input() public openPizzaLibPopoverWidth: string | null;
  @Input() public openPizzaLibPopoverPositionType: 'top' | 'bottom' | null;
  @Input() public openPizzaLibPopoverCloseButton: boolean;
  @Input() public openPizzaLibPopoverType: string;
  @Input() public openPizzaLibPopoverIsHide: boolean;
  @Input() public openPizzaLibPopoverContext: Record<string, unknown> | null = null;

  @Input() public closeHandler = EMPTY_FUNCTION;

  constructor(
    private popoverService: PopoverService,
    private element: ElementRef
  ) {}

  @HostListener('click', ['$event']) private onClick(): void {
    const element =
      this.element?.nativeElement.tagName === 'BUTTON'
        ? this.element?.nativeElement
        : this.element?.nativeElement?.querySelector('button')
        ? this.element?.nativeElement?.querySelector('button')
        : this.element?.nativeElement?.closest('button');

    element.classList?.add('js-neo-ui-popover-reference-point');
    const popoverData = {
      event: element,
      closeHandler: () => this?.closeHandler?.(),
      title: this.openPizzaLibPopoverTitle,
      gutter: this.openPizzaLibPopoverGutter,
      width: this.openPizzaLibPopoverWidth,
      positionType: this.openPizzaLibPopoverPositionType,
      type: this.openPizzaLibPopoverType,
      isHide: this.openPizzaLibPopoverIsHide,
      closeButton: this.openPizzaLibPopoverCloseButton,
      component: PopoverBaseComponentComponent,
      context: {
        content: this.openPizzaLibPopoverFromTemplate,
        ...this.openPizzaLibPopoverContext,
      },
    } as PopoverData;

    this.popoverService.open(element, popoverData);
  }
}
