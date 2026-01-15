import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  HostListener,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { PopoverData, PopoverService } from './services';
import { BrowserService, DestroyService } from '../../services';
import { filter, fromEvent, takeUntil } from 'rxjs';

@Component({
  selector: 'pizza-lib-popover',
  standalone: true,
  imports: [NgClass, NgStyle],
  providers: [DestroyService],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  @ViewChild('containerPopover') private container!: {
    nativeElement: { contains: (arg0: EventTarget | null) => any };
  };

  @ViewChild('popoverContent', { static: false, read: ViewContainerRef })
  public popover!: ViewContainerRef;

  @ViewChild('popoverBody', { static: false, read: ViewContainerRef })
  public popoverBody!: ViewContainerRef;

  public isOpen = false;
  public isHide: boolean | undefined;
  public popoverComponent!: ComponentRef<unknown>;
  public popoverData!: PopoverData;
  public eventRef: HTMLElement | null = null;
  public positionType: 'top' | 'bottom' | null = null;

  public horizontalScrollOffset = 0;

  public title: string | null = null;
  public closeButton = true;

  public style: {
    opacity?: number;
    transform?: string;
    width?: string;
    marginTop?: string;
    paddingTop?: string;
  } = { opacity: 0 };

  private html: HTMLHtmlElement | null = null;
  private body: HTMLBodyElement | null = null;

  private static toElement(value: Event | HTMLElement | undefined | null): HTMLElement | null {
    if (!value) return null;
    if (value instanceof HTMLElement) return value;
    const target = (value as Event).target;
    return target instanceof HTMLElement ? target : null;
  }

  constructor(
    private browser: BrowserService,
    private readonly popoverService: PopoverService,
    private destroy$: DestroyService,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.popoverService.popoverSequence$.subscribe((popoverData) =>
      popoverData ? this.initPopover(popoverData) : this.close()
    );

    this.subscriptionClosingCheck();
  }

  private initPopover(popoverData: PopoverData): void {
    const nextEventRef = PopoverComponent.toElement(popoverData.event);
    if (!nextEventRef) {
      this.close();
      return;
    }

    if (this.eventRef === nextEventRef) {
      this.close();
    } else {
      this.eventRef = nextEventRef;

      this.popoverComponent = this.popover.createComponent(
        popoverData.component!
      );

      this.buildContext(popoverData.context);
      this.setPopoverParams(popoverData);

      this.isOpen = true;

      document
        ?.querySelector('.neo-popover__body-scroll-container > div')
        ?.scrollIntoView(); // scroll to top popover

      if (this.eventRef) {
        const popoverButton = this.eventRef.closest('.js-neo-ui-popover-button');
        if (popoverButton) {
          popoverButton.classList.add('is-active');
        }

        this.html = document.querySelector('html');
        this.body = document.querySelector('body');

        const button = this.eventRef.closest('button');
        if (button) {
          button.classList.add('is-active');
        }

        this.sizeService(
          this.popoverData.type ?? undefined,
          this.eventRef,
          this.popoverData.width ?? undefined
        );

        this.offsetService(
          this.positionType ?? undefined,
          this.eventRef,
          this.popoverData.gutter
        );

        if (window && window.innerWidth < 720) {
          this.html!.style.overflow = 'hidden';
          this.body!.style.overflow = 'hidden';
        }
        if (this.popoverData.type === 'select') {
          this.style.marginTop = '-4px';
          this.style.paddingTop = '4px';
        }
      }
    }
  }

  private subscriptionClosingCheck(): void {
    if (this.browser.isBrowser) {
      fromEvent(document, 'click')
        .pipe(
          filter(() => this.isOpen),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (e) => {
            if (
              !(
                (e.target as HTMLElement).closest('.js-neo-ui-popover-body') ||
                (e.target as HTMLElement).closest(
                  '.js-neo-ui-popover-reference-point'
                )
              )
            ) {
              this.close();
            }
          },
        });
    }
  }

  private buildContext(context: PopoverData['context']): void {
    if (context) {
      Object.keys(context).forEach((key) => {
        (this.popoverComponent.instance as Record<string, unknown>)[key] = context[key];
      });
    }
  }

  private setPopoverParams(popoverData: PopoverData): void {
    if (popoverData) {
      this.title = popoverData.title ? popoverData.title : null;
      this.isHide = popoverData.isHide;
      this.popoverData = popoverData;

      this.positionType = popoverData.positionType ?? null;
      this.closeButton = popoverData.closeButton;
      this.eventRef = PopoverComponent.toElement(this.popoverData.event);
    }
  }

  @HostListener('window:scroll', ['$event'])
  public onWindowScroll(event?: Event): void {
    if (this.isOpen) {
      if (this.positionType === 'bottom') {
        const referencePointElement = this.eventRef;
        if (!referencePointElement) return;

        if (referencePointElement.classList.contains('icon')) {
          let horizontalOffsetTotalLocal =
            this.horizontalScrollOffset +
              referencePointElement.getBoundingClientRect().width / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.getBoundingClientRect().width / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotalLocal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top +
            referencePointElement.getBoundingClientRect().height +
            Number(this.popoverData.gutter ?? 0) +
            'px'
          })`;

          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(this.style.width as string, 10));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotalLocal =
                this.horizontalScrollOffset +
                  referencePointElement.getBoundingClientRect().width / 2 >
                16
                  ? this.horizontalScrollOffset +
                    referencePointElement.getBoundingClientRect().width / 2
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotalLocal + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top +
                referencePointElement.getBoundingClientRect().height +
                Number(this.popoverData.gutter ?? 0) +
                'px'
              })`;
            }
          }, 10);
        } else {
          let horizontalOffsetTotalLocal =
            referencePointElement.getBoundingClientRect().left -
              parseInt(this.style.width as string, 10) / 2 +
              referencePointElement.offsetWidth / 2 >
            16
              ? referencePointElement.getBoundingClientRect().left -
                parseInt(this.style.width as string, 10) / 2 +
                referencePointElement.offsetWidth / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotalLocal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top +
            (this.eventRef?.offsetHeight ?? 0) +
            Number(this.popoverData.gutter ?? 0) +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(this.style.width as string, 10));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotalLocal =
                this.horizontalScrollOffset > 16
                  ? this.horizontalScrollOffset
                  : 16;
              if (this.eventRef) {
                this.style.transform = `translate(${
                  horizontalOffsetTotalLocal + 'px'
                }, ${
                  this.eventRef.getBoundingClientRect().top +
                  window.scrollY +
                  this.eventRef.offsetHeight +
                  Number(this.popoverData.gutter ?? 0) +
                  'px'
                })`;
              }
            }
          }, 10);
        }

        return;
      }
      if (this.positionType === 'top') {
        const referencePointElement = this.eventRef;
        if (!referencePointElement) return;

        if (referencePointElement.classList.contains('icon')) {
          let horizontalOffsetTotalTop =
            this.horizontalScrollOffset +
              referencePointElement.getBoundingClientRect().width / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.getBoundingClientRect().width / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotalTop + 'px'}, ${
            referencePointElement.getBoundingClientRect().top -
            this.popoverBody.element.nativeElement.offsetHeight -
            Number(this.popoverData.gutter ?? 0) +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(this.style.width as string, 10));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotalTop =
                this.horizontalScrollOffset +
                  referencePointElement.getBoundingClientRect().width / 2 >
                16
                  ? this.horizontalScrollOffset +
                    referencePointElement.getBoundingClientRect().width / 2
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotalTop + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top -
                this.popoverBody.element.nativeElement.offsetHeight -
                Number(this.popoverData.gutter ?? 0) +
                'px'
              })`;
            }
          }, 10);
        } else {
          let horizontalOffsetTotalTopElse =
            this.horizontalScrollOffset +
              referencePointElement.offsetWidth / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.offsetWidth / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotalTopElse + 'px'}, ${
            referencePointElement.getBoundingClientRect().top -
            this.popoverBody.element.nativeElement.offsetHeight -
            Number(this.popoverData.gutter ?? 0) +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(this.style.width as string, 10));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotalTopElse =
                this.horizontalScrollOffset > 16
                  ? this.horizontalScrollOffset
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotalTopElse + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top -
                this.popoverBody.element.nativeElement.offsetHeight -
                Number(this.popoverData.gutter ?? 0) +
                'px'
              })`;
            }
          }, 10);
        }
        return;
      }
      if (!this.eventRef) return;

      const horizontalOffsetTotal =
        this.eventRef.getBoundingClientRect().left > 16
          ? this.eventRef.getBoundingClientRect().left
          : 16;

      this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
        this.eventRef.getBoundingClientRect().top +
        window.scrollY +
        this.eventRef.offsetHeight +
        Number(this.popoverData.gutter ?? 0) +
        'px'
      })`;
      setTimeout(() => {
        let offset =
          window &&
          window.innerWidth -
            (this.popover.element.nativeElement.getBoundingClientRect().left +
              parseInt(this.style.width as string, 10));
        if (offset < 0 && this.eventRef) {
          offset = offset - 16;
          const horizontalOffsetTotalDefault =
            this.eventRef.getBoundingClientRect().left + offset > 16
              ? this.eventRef.getBoundingClientRect().left + offset
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotalDefault + 'px'}, ${
            this.eventRef.getBoundingClientRect().top +
            window.scrollY +
            this.eventRef.offsetHeight +
            Number(this.popoverData.gutter ?? 0) +
            'px'
          })`;
        }
      }, 10);
      setTimeout(() => {
        this.style.opacity = 1;
      }, 30);
    }
  }

  @HostListener('window:keyup', ['$event.keyCode'])
  public close(code?: number): void {
    if (code !== undefined && code !== 27) {
      return;
    }

    if (this.popoverComponent) {
      this.popoverComponent.destroy();
    }

    try {
      if (this.eventRef) {
        this.eventRef.classList.remove('is-active');
        this.eventRef.classList.remove('js-neo-ui-popover-button');
      }

      // if (
      //   this.eventRef &&
      //   this.eventRef
      //     .closest('button')
      //     .classList.contains('js-neo-ui-popover-reference-point-container')
      // ) {
      //   this.eventRef
      //     .closest('button')
      //     .classList.remove('is-active');
      // }
    } catch (e) {
      // Error handled silently
    }

    this.clearState();
    this.cdr.detectChanges();
  }

  private offsetService(
    positionType: 'bottom' | 'top' | undefined = 'bottom',
    ref: HTMLElement,
    gutter: string | number | null | undefined = 8
  ): void {
    this.style.opacity = 0;
    const gutterNum = typeof gutter === 'string' ? Number(gutter) : (gutter ?? 8);


    try {
      setTimeout(() => {
        if (positionType === 'bottom') {
          const referencePointElement = ref;

          if (referencePointElement.classList.contains('icon')) {
            this.horizontalScrollOffset =
              referencePointElement.getBoundingClientRect().left -
              parseInt(this.style.width as string, 10) / 2;
            let horizontalOffsetTotal =
              this.horizontalScrollOffset +
                referencePointElement.getBoundingClientRect().width / 2 >
              16
                ? this.horizontalScrollOffset +
                  referencePointElement.getBoundingClientRect().width / 2
                : 16;
            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top +
              referencePointElement.getBoundingClientRect().height +
              Number(this.popoverData.gutter ?? 0) +
              'px'
            })`;

            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(this.style.width as string, 10));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  offset;
                horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.getBoundingClientRect().width / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.getBoundingClientRect().width / 2
                    : 16;
                this.style.transform = `translate(${
                  horizontalOffsetTotal + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top +
                  referencePointElement.getBoundingClientRect().height +
                  Number(this.popoverData.gutter ?? 0) +
                  'px'
                })`;
              }
            }, 10);
          } else {

            let horizontalOffsetTotal =
              referencePointElement.getBoundingClientRect().left -
                parseInt(this.style.width as string, 10) / 2 +
                referencePointElement.offsetWidth / 2 >
              16
                ? referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  referencePointElement.offsetWidth / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotal + 29 + 'px'
            }, ${
              ref.getBoundingClientRect().top +
              window.scrollY +
              (this.eventRef?.offsetHeight ?? 0) +
              gutterNum +
              'px'
            })`;


            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(this.style.width as string, 10));

              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  offset;
                horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  0
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;
                if (this.eventRef && "offsetHeight" in this.eventRef) {
                  this.style.transform = `translate(${
                    horizontalOffsetTotal + 'px'
                  }, ${
                    ref.getBoundingClientRect().top +
                    window.scrollY +
                    this.eventRef.offsetHeight +
                    gutterNum +
                    'px'
                  })`;
                }
              }
            }, 10);
          }
          return;
        }
        if (positionType === 'top') {
          const referencePointElement = ref;

          if (referencePointElement.classList.contains('icon')) {
            this.horizontalScrollOffset =
              referencePointElement.getBoundingClientRect().left -
              parseInt(this.style.width as string, 10) / 2;
            const horizontalOffsetTotal =
              this.horizontalScrollOffset +
                referencePointElement.getBoundingClientRect().width / 2 >
              16
                ? this.horizontalScrollOffset +
                  referencePointElement.getBoundingClientRect().width / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top -
              this.popoverBody.element.nativeElement.offsetHeight -
              gutterNum +
              'px'
            })`;
            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(this.style.width as string, 10));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  offset;
                const horizontalOffsetTotalTopIcon =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;
                this.style.transform = `translate(${
                  horizontalOffsetTotalTopIcon + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top -
                  this.popoverBody.element.nativeElement.offsetHeight -
                  gutterNum +
                  'px'
                })`;
              }
            }, 10);
          } else {
            const horizontalOffsetTotalTopElse =
              referencePointElement.getBoundingClientRect().left -
                parseInt(this.style.width as string, 10) / 2 +
                referencePointElement.offsetWidth / 2 >
              16
                ? referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  referencePointElement.offsetWidth / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotalTopElse + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top -
              this.popoverBody.element.nativeElement.offsetHeight -
              gutterNum +
              'px'
            })`;

            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(this.style.width as string, 10));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(this.style.width as string, 10) / 2 +
                  offset;

                const horizontalOffsetTotalTopElseInner =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;

                this.style.transform = `translate(${
                  horizontalOffsetTotalTopElseInner + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top -
                  this.popoverBody.element.nativeElement.offsetHeight -
                  gutterNum +
                  'px'
                })`;
              }
            }, 30);
          }
          return;
        }

        this.style.transform = `translate(${
          ref.getBoundingClientRect().left + 'px'
        }, ${
          ref.getBoundingClientRect().top + ref.offsetHeight + gutterNum + 'px'
        })`;
        setTimeout(() => {
          let offset =
            window &&
            window.innerWidth -
              (this.popover.element.nativeElement.getBoundingClientRect().left +
                parseInt(this.style.width as string, 10));
          if (offset < 0) {
            offset = offset - 16;
            this.horizontalScrollOffset =
              ref.getBoundingClientRect().left + offset;
            const horizontalOffsetTotal =
              this.horizontalScrollOffset > 16
                ? this.horizontalScrollOffset
                : 16;
            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              ref.getBoundingClientRect().top + ref.offsetHeight + gutterNum + 'px'
            })`;

          }
        }, 10);
      }, 10);

      setTimeout(() => {
        this.style.opacity = 1;
        this.cdr.detectChanges();
      }, 80);
    } catch (e) {
      // Error handled silently
      this.close();
    }
  }

  private sizeService(type: string | null | undefined = '', ref: HTMLElement, w: string | null | undefined = '320'): void {
    const width = parseInt(w ?? '320', 10);
    if (type !== 'select' && width === null) {
      const button = ref.closest('button');
      if (button) {
        this.style.width = button.offsetWidth + 'px';
      } else {
        this.style.width = '320px';
      }
      return;
    }
    if (type === 'select') {
      this.style.width = ref.offsetWidth + 'px';
      return;
    }

    this.style.width = width + 'px';
  }

  @HostListener('document:click', ['$event'])
  public onClickOutPopover(event: Event): void {
    if (this.isHide) {
      // let parentElement = (event.target as HTMLElement).parentNode as HTMLElement;
      const parentElement = event.target as HTMLElement;

      if (
        !this.container.nativeElement.contains(event.target) &&
        !parentElement.classList.contains('as-n-c-input-box__clear-button') &&
        !parentElement.classList.contains('icon') &&
        !parentElement.classList.contains('neo-ui-select-body__item') &&
        this.isOpen &&
        this.eventRef !== event.target
      ) {
        // check click origin
        this.close();
      }
    }
  }

  private clearState() {
    this.isOpen = false;
    this.eventRef = null;
    this.style = { opacity: 0 };
    this.positionType = null;

    if (this.html && this.body) {
      this.html.style.overflow = '';
      this.body.style.overflow = '';
    }
  }
}
