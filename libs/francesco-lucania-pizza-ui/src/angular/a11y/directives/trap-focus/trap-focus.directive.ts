import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
} from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Directive({
  selector: '[neoTrapFocus]',
  standalone: true,
})
export class TrapFocusDirective implements AfterViewInit {
  // необязательно передавать значение в state
  // оно нужно только для динамических компонетов (например модальные окна, поповеры и тд)
  @Input('neoTrapFocus') public set setState(value: unknown) {
    if (this.state !== undefined) {
      this.state = Boolean(value);
    }
    this.trapFocus(this.elementRef.nativeElement);
  }

  private focusElements: Observable<any>;
  private firstFocusableElement: HTMLElement;
  private lastFocusableElement: HTMLElement;
  private state = true;

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  public ngAfterViewInit(): void {
    this.trapFocus(this.elementRef.nativeElement);
  }

  private trapFocus(element: HTMLElement): void {
    this.cdr.detectChanges();
    const focusableEls1 = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"],' +
        'input[type="radio"], input[type="checkbox"], select'
    );
    const focusableEls = Array.from(focusableEls1).filter(
      (el: any) => !el.disabled
    );

    this.firstFocusableElement = element;
    this.lastFocusableElement = focusableEls[
      focusableEls.length - 1
    ] as HTMLElement;
    if (!this.focusElements) {
      this.focusElements = fromEvent(element, 'keydown');
      this.focusElements
        .pipe(filter((e: KeyboardEvent) => e.code === 'Tab'))
        .subscribe({
          next: (e: KeyboardEvent) => {
            this.cdr.detectChanges();
            if (e.shiftKey) {
              /* shift + tab */ if (
                document.activeElement === this.firstFocusableElement
              ) {
                this.lastFocusableElement.focus();
              }
            } /* tab */ else {
              if (document.activeElement === this.lastFocusableElement) {
                this.firstFocusableElement?.focus();
              }
            }
          },
        });
    }
  }
}
