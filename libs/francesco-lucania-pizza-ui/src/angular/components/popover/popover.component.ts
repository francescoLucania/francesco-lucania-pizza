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
  selector: 'neo-ui-popover',
  standalone: true,
  imports: [NgClass, NgStyle],
  providers: [DestroyService],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  @ViewChild('containerPopover') private container: {
    nativeElement: { contains: (arg0: EventTarget | null) => any };
  };

  @ViewChild('popoverContent', { static: false, read: ViewContainerRef })
  public popover!: ViewContainerRef;

  @ViewChild('popoverBody', { static: false, read: ViewContainerRef })
  public popoverBody!: ViewContainerRef;

  public isOpen = false;
  public isHide: boolean | undefined;
  public popoverComponent!: ComponentRef<any>;
  public popoverData!: any;
  public eventRef!: any;
  public positionType!: any;

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

  private html: any | null = null;
  private body: any | null = null;

  public constructor(
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
    if (this.eventRef === popoverData.event) {
      this.close();
    } else {
      this.eventRef = popoverData.event;

      this.popoverComponent = this.popover.createComponent(
        popoverData.component
      );

      this.buildContext(popoverData.context);
      this.setPopoverParams(popoverData);

      this.isOpen = true;

      (document as any)
        ?.querySelector('.neo-popover__body-scroll-container > div')
        ?.scrollIntoView(); // scroll to top popover

      if (popoverData?.event?.target || popoverData.event) {
        if (this.eventRef.closest('.js-neo-ui-popover-button')) {
          this.eventRef
            .closest('.js-neo-ui-popover-button')
            .classList.add('is-active');
        }

        this.html = document.querySelector('html');
        this.body = document.querySelector('body');

        if (this.eventRef.closest('button')) {
          this.eventRef.closest('button').classList.add('is-active');
        }

        this.sizeService(
          this.popoverData.type,
          this.eventRef,
          this.popoverData.width
        );

        this.offsetService(
          this.positionType,
          this.eventRef,
          this.popoverData.gutter
        );

        if (window && window.innerWidth < 720) {
          this.html.style.overflow = 'hidden';
          this.body.style.overflow = 'hidden';
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

  private buildContext(context: any): void {
    if (context) {
      Object.keys(context).forEach((key) => {
        this.popoverComponent.instance[key] = context[key];
      });
    }
  }

  private setPopoverParams(popoverData: PopoverData): void {
    if (popoverData) {
      this.title = popoverData.title ? popoverData.title : null;
      this.isHide = popoverData.isHide;
      this.popoverData = popoverData;

      this.positionType = popoverData.positionType;
      this.closeButton = popoverData.closeButton;

      this.eventRef = this.popoverData.event.target || this.popoverData.event;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (this.isOpen) {
      if (this.positionType === 'bottom') {
        const referencePointElement = this.eventRef;

        if (referencePointElement.classList.contains('icon')) {
          let horizontalOffsetTotal =
            this.horizontalScrollOffset +
              referencePointElement.width.baseVal.value / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.width.baseVal.value / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top +
            referencePointElement.height.baseVal.value +
            this.popoverData.gutter +
            'px'
          })`;

          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(<string>this.style.width));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotal =
                this.horizontalScrollOffset +
                  referencePointElement.width.baseVal.value / 2 >
                16
                  ? this.horizontalScrollOffset +
                    referencePointElement.width.baseVal.value / 2
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotal + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top +
                referencePointElement.height.baseVal.value +
                this.popoverData.gutter +
                'px'
              })`;
            }
          }, 10);
        } else {
          let horizontalOffsetTotal =
            referencePointElement.getBoundingClientRect().left -
              parseInt(<string>this.style.width) / 2 +
              referencePointElement.offsetWidth / 2 >
            16
              ? referencePointElement.getBoundingClientRect().left -
                parseInt(<string>this.style.width) / 2 +
                referencePointElement.offsetWidth / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top +
            this.eventRef.offsetHeight +
            this.popoverData.gutter +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(<string>this.style.width));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotal =
                this.horizontalScrollOffset > 16
                  ? this.horizontalScrollOffset
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotal + 'px'
              }, ${
                this.eventRef.getBoundingClientRect().top +
                (window as any).scrollY +
                this.eventRef.offsetHeight +
                this.popoverData.gutter +
                'px'
              })`;
            }
          }, 10);
        }

        return;
      }
      if (this.positionType === 'top') {
        const referencePointElement = this.eventRef;

        if (referencePointElement.classList.contains('icon')) {
          let horizontalOffsetTotal =
            this.horizontalScrollOffset +
              referencePointElement.width.baseVal.value / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.width.baseVal.value / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top -
            this.popoverBody.element.nativeElement.offsetHeight -
            this.popoverData.gutter +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(<string>this.style.width));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotal =
                this.horizontalScrollOffset +
                  referencePointElement.width.baseVal.value / 2 >
                16
                  ? this.horizontalScrollOffset +
                    referencePointElement.width.baseVal.value / 2
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotal + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top -
                this.popoverBody.element.nativeElement.offsetHeight -
                this.popoverData.gutter +
                'px'
              })`;
            }
          }, 10);
        } else {
          let horizontalOffsetTotal =
            this.horizontalScrollOffset +
              referencePointElement.offsetWidth / 2 >
            16
              ? this.horizontalScrollOffset +
                referencePointElement.offsetWidth / 2
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
            referencePointElement.getBoundingClientRect().top -
            this.popoverBody.element.nativeElement.offsetHeight -
            this.popoverData.gutter +
            'px'
          })`;
          setTimeout(() => {
            let offset =
              window &&
              window.innerWidth -
                (this.popover.element.nativeElement.getBoundingClientRect()
                  .left +
                  parseInt(<string>this.style.width));
            if (offset < 0) {
              offset = offset - 16;
              horizontalOffsetTotal =
                this.horizontalScrollOffset > 16
                  ? this.horizontalScrollOffset
                  : 16;
              this.style.transform = `translate(${
                horizontalOffsetTotal + 'px'
              }, ${
                referencePointElement.getBoundingClientRect().top -
                this.popoverBody.element.nativeElement.offsetHeight -
                this.popoverData.gutter +
                'px'
              })`;
            }
          }, 10);
        }
        return;
      }
      const horizontalOffsetTotal =
        this.eventRef.getBoundingClientRect().left > 16
          ? this.eventRef.getBoundingClientRect().left
          : 16;

      this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
        this.eventRef.getBoundingClientRect().top +
        (window as any).scrollY +
        this.eventRef.offsetHeight +
        this.popoverData.gutter +
        'px'
      })`;
      setTimeout(() => {
        let offset =
          window &&
          window.innerWidth -
            (this.popover.element.nativeElement.getBoundingClientRect().left +
              parseInt(<string>this.style.width));
        if (offset < 0) {
          offset = offset - 16;
          const horizontalOffsetTotal =
            this.eventRef.getBoundingClientRect().left + offset > 16
              ? this.eventRef.getBoundingClientRect().left + offset
              : 16;
          this.style.transform = `translate(${horizontalOffsetTotal + 'px'}, ${
            this.eventRef.getBoundingClientRect().top +
            (window as any).scrollY +
            this.eventRef.offsetHeight +
            this.popoverData.gutter +
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
  public close(code = 27) {
    if (code !== 27) {
      return;
    }

    if (this.popoverComponent) {
      this.popoverComponent.destroy();
    }

    try {
      if (this.eventRef) {
        console.log('this.eventRef', this.eventRef);
        this.eventRef?.classList
          .remove('is-active')
          ?.classList.remove('js-neo-ui-popover-button');
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
      console.log('err', e);
    }

    this.clearState();
    this.cdr.detectChanges();
  }

  private offsetService(
    positionType: 'bottom' | 'top' = 'bottom',
    ref: any,
    gutter = 8
  ) {
    this.style.opacity = 0;

    console.log('positionType', positionType);

    try {
      setTimeout(() => {
        if (positionType === 'bottom') {
          const referencePointElement = ref;

          if (referencePointElement.classList.contains('icon')) {
            this.horizontalScrollOffset =
              referencePointElement.getBoundingClientRect().left -
              parseInt(<string>this.style.width) / 2;
            let horizontalOffsetTotal =
              this.horizontalScrollOffset +
                referencePointElement.width.baseVal.value / 2 >
              16
                ? this.horizontalScrollOffset +
                  referencePointElement.width.baseVal.value / 2
                : 16;
            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top +
              referencePointElement.height.baseVal.value +
              this.popoverData.gutter +
              'px'
            })`;

            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(<string>this.style.width));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  offset;
                horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.width.baseVal.value / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.width.baseVal.value / 2
                    : 16;
                this.style.transform = `translate(${
                  horizontalOffsetTotal + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top +
                  referencePointElement.height.baseVal.value +
                  this.popoverData.gutter +
                  'px'
                })`;
              }
            }, 10);
          } else {
            console.log('1', positionType);

            console.log('2', this.style.width);

            let horizontalOffsetTotal =
              referencePointElement.getBoundingClientRect().left -
                parseInt(<string>this.style.width) / 2 +
                referencePointElement.offsetWidth / 2 >
              16
                ? referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  referencePointElement.offsetWidth / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotal + 29 + 'px'
            }, ${
              ref.getBoundingClientRect().top +
              (window as any).scrollY +
              this.eventRef.offsetHeight +
              gutter +
              'px'
            })`;

            console.log('ref.scrollTop', ref.scrollTop);
            console.log(
              'ref.getBoundingClientRect().top',
              ref.getBoundingClientRect().top
            );
            console.log(
              'this.eventRef.offsetHeight',
              this.eventRef.offsetHeight
            );
            console.log('gutter', gutter);

            console.log(
              '6',
              ref.getBoundingClientRect().top +
                this.eventRef.offsetHeight +
                gutter +
                'px'
            );

            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(<string>this.style.width));

              console.log('3', this.style.width);

              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  offset;
                horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  0
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;
                this.style.transform = `translate(${
                  horizontalOffsetTotal + 'px'
                }, ${
                  ref.getBoundingClientRect().top +
                  (window as any).scrollY +
                  this.eventRef.offsetHeight +
                  gutter +
                  'px'
                })`;
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
              parseInt(<string>this.style.width) / 2;
            const horizontalOffsetTotal =
              this.horizontalScrollOffset +
                referencePointElement.width.baseVal.value / 2 +
                this.horizontalScrollOffset +
                referencePointElement.width.baseVal.value / 2 >
              16
                ? this.horizontalScrollOffset +
                  referencePointElement.width.baseVal.value / 2 +
                  this.horizontalScrollOffset +
                  referencePointElement.width.baseVal.value / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top -
              this.popoverBody.element.nativeElement.offsetHeight -
              gutter +
              'px'
            })`;
            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(<string>this.style.width));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  offset;
                const horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;
                this.style.transform = `translate(${
                  horizontalOffsetTotal + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top -
                  this.popoverBody.element.nativeElement.offsetHeight -
                  gutter +
                  'px'
                })`;
              }
            }, 10);
          } else {
            const horizontalOffsetTotal =
              referencePointElement.getBoundingClientRect().left -
                parseInt(<string>this.style.width) / 2 +
                referencePointElement.offsetWidth / 2 >
              16
                ? referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  referencePointElement.offsetWidth / 2
                : 16;

            this.style.transform = `translate(${
              horizontalOffsetTotal + 'px'
            }, ${
              referencePointElement.getBoundingClientRect().top -
              this.popoverBody.element.nativeElement.offsetHeight -
              gutter +
              'px'
            })`;

            setTimeout(() => {
              let offset =
                window &&
                window.innerWidth -
                  (this.popover.element.nativeElement.getBoundingClientRect()
                    .left +
                    parseInt(<string>this.style.width));
              if (offset < 0) {
                offset = offset - 16;
                this.horizontalScrollOffset =
                  referencePointElement.getBoundingClientRect().left -
                  parseInt(<string>this.style.width) / 2 +
                  offset;

                const horizontalOffsetTotal =
                  this.horizontalScrollOffset +
                    referencePointElement.offsetWidth / 2 >
                  16
                    ? this.horizontalScrollOffset +
                      referencePointElement.offsetWidth / 2
                    : 16;

                this.style.transform = `translate(${
                  horizontalOffsetTotal + 'px'
                }, ${
                  referencePointElement.getBoundingClientRect().top -
                  this.popoverBody.element.nativeElement.offsetHeight -
                  gutter +
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
          ref.getBoundingClientRect().top + ref.offsetHeight + gutter + 'px'
        })`;
        setTimeout(() => {
          let offset =
            window &&
            window.innerWidth -
              (this.popover.element.nativeElement.getBoundingClientRect().left +
                parseInt(<string>this.style.width));
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
              ref.getBoundingClientRect().top + ref.offsetHeight + gutter + 'px'
            })`;

            console.log(
              '4',
              ref.getBoundingClientRect().top + ref.offsetHeight + gutter + 'px'
            );
          }
        }, 10);
      }, 10);

      setTimeout(() => {
        this.style.opacity = 1;
        this.cdr.detectChanges();
      }, 80);
    } catch (e) {
      console.log('err', e);
      this.close();
    }
  }

  private sizeService(type = '', ref: any, w = '320') {
    const width = parseInt(w);
    if (type !== 'select' && width === null) {
      if (ref.closest('button')) {
        this.style.width = ref.closest('button').offsetWidth + 'px';
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
  onClickOutPopover(event: Event) {
    if (this.isHide) {
      // let parentElement = <HTMLElement>(<HTMLElement>event.target).parentNode;
      const parentElement = <HTMLElement>event.target;

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
