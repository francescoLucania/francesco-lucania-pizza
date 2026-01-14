import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[neoElementFocus]',
  standalone: true,
})
export class ElementFocusDirective implements OnDestroy {
  @Input('neoElementFocusContextClass') public contextClass = 'outline-base';

  @HostBinding('class') private cssClass = this.contextClass;
  @HostBinding('tabindex') private tabIndex =
    this.elementRef.nativeElement.tabIndex !== -1
      ? `${this.elementRef.nativeElement.tabIndex}`
      : '0';

  // Если в @Input() не передано значение, то эелемент получит фокус только при ициализации
  @Input('neoElementFocus') public set onFocus(value: unknown) {
    if (value === false) {
      // Если передан false – возвращаем фокус на prevElement(тоже самое на ngOnDestroy())
      this.toPrevElement();
    } else {
      // Записываем предыдущий элемент
      if (document.activeElement) {
        this.prevElement = document.activeElement as HTMLElement;
      }
      // Если передана переменная, то элемент будет получать фокус при изменении переданного значения(кроме значения false)
      this.elementRef.nativeElement.focus();
    }
  }

  // В prevElement записываем предыдущий элемент, на него возвращается focus при esiaElementFocus = false и ngOnDestroy()
  private prevElement: HTMLElement;

  constructor(private elementRef: ElementRef) {}

  private toPrevElement(): void {
    if (this.prevElement) {
      this.prevElement.focus();
    }
  }

  public ngOnDestroy(): void {
    this.toPrevElement();
  }
}
