import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ModalService } from './services/modal/modal.service';
import { IModalDataInterface } from './models';
import { MediaQueriesService } from '../../services';
import { NgClass } from '@angular/common';
import { ElementFocusDirective, TrapFocusDirective } from '../../a11y';

@Component({
  selector: 'pizza-lib-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ElementFocusDirective, TrapFocusDirective],
  standalone: true,
})
export class ModalComponent implements OnInit {
  @ViewChild('modalContent', { read: ViewContainerRef })
  public modal!: ViewContainerRef;
  @ViewChild('modalContainer', { read: ElementRef })
  public modalContainer!: ElementRef;
  @ViewChild('modalBody', { read: ElementRef })
  public modalBody!: ElementRef;

  public modalState = this.modalService.modalState$;
  public modalContext: ComponentRef<unknown> | null = null;

  public isOpen = false;
  public closeButton = true;
  public backgroundClick = true;
  public html: HTMLHtmlElement | null = null;
  public body: HTMLBodyElement | null = null;
  public scrollState = false;

  constructor(
    private readonly modalService: ModalService,
    private changeDetector: ChangeDetectorRef,
    private mediaQueriesService: MediaQueriesService
  ) {}

  @HostListener('window:keyup', ['$event.keyCode'])
  public keyClose(code?: number): void {
    if (code !== undefined && code === 27 && this.closeButton) {
      this.close();
    }
  }

  public ngOnInit(): void {
    this.modalState.subscribe((modalData: IModalDataInterface | null) => {
      if (!modalData?.component) {
        this.close();
        return;
      }

      if (this.isOpen) {
        this.close(true); // для закрытия предыдущего окна(если есть)
      }

      this.modalContext = this.modal.createComponent(modalData.component);
      if (modalData.context && this.modalContext) {
        const instance = this.modalContext.instance as Record<string, unknown>;
        Object.keys(modalData.context).forEach((key) => {
          instance[key] = modalData.context![key];
        });
      }

      const instance = this.modalContext.instance as { closable?: boolean; backgroundClick?: boolean };
      this.closeButton = instance.closable ?? true;
      this.backgroundClick = instance.backgroundClick ?? true;

      this.isOpen = true;
      setTimeout(() => {
        this.changeDetector.detectChanges();
        this.settingView();
        this.modalBody.nativeElement.focus();
      });
    });
  }

  private checkHeightModalBody(deviceType: string): void {
    if (deviceType !== 'sm') {
      const windowHeight = window.innerHeight;
      const modalBodyHeight = this.modalBody.nativeElement.offsetHeight + 96;
      this.scrollState = modalBodyHeight > windowHeight;
    } else {
      this.scrollState = false;
    }
  }

  private settingView(): void {
    this.html = document.querySelector('html');
    this.body = document.querySelector('body');

    if (this.html) {
      this.html.style.overflow = 'hidden';
    }
    if (this.body) {
      this.body.style.overflow = 'hidden';
    }

    this.checkHeightModalBody(this.mediaQueriesService.getType());
    this.mediaQueriesService.deviceType$.subscribe((data) => {
      if (data?.deviceType) {
        this.checkHeightModalBody(data.deviceType);
      }
      this.changeDetector.markForCheck();
    });
  }

  public close(force = false): void {
    if (!force && !this.closeButton) {
      return;
    }
    this.modalContext?.destroy();
    const instance = this.modalContext?.instance as { closeHandler?: () => void } | undefined;
    instance?.closeHandler?.();
    this.modalContext = null;
    this.isOpen = false;
    if (this.html && this.body) {
      this.html.style.overflow = '';
      this.body.style.overflow = '';
    }
    this.changeDetector.detectChanges();
  }
}
