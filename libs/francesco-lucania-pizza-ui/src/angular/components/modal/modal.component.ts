import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
  selector: 'neo-ui-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, ElementFocusDirective, TrapFocusDirective],
  standalone: true,
})
export class ModalStandaloneComponent implements OnInit {
  @ViewChild('modalContent', { read: ViewContainerRef })
  public modal: ViewContainerRef;
  @ViewChild('modalContainer', { read: ElementRef })
  public modalContainer: ElementRef;
  @ViewChild('modalBody', { read: ElementRef })
  public modalBody: ElementRef;

  public modalState = this.modalService.modalState$;
  public modalContext: any;

  public isOpen = false;
  public closeButton = true;
  public backgroundClick = true;
  public html: HTMLHtmlElement | null;
  public body: HTMLBodyElement | null;
  public scrollState = false;

  constructor(
    private readonly modalService: ModalService,
    private changeDetector: ChangeDetectorRef,
    private mediaQueriesService: MediaQueriesService
  ) {}

  @HostListener('window:keyup', ['$event.keyCode'])
  private keyClose(code: number) {
    if (code === 27 && this.closeButton) {
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
      if (modalData.context) {
        Object.keys(modalData.context).forEach((key) => {
          this.modalContext.instance[key] = modalData.context[key];
        });
      }

      this.closeButton = this.modalContext.instance.closable;
      this.backgroundClick = this.modalContext.instance.backgroundClick;

      this.isOpen = true;
      setTimeout(() => {
        this.changeDetector.detectChanges();
        this.settingView();
        this.modalBody.nativeElement.focus();
      });
    });
  }

  private checkHeightModalBody(deviceType: any): void {
    if (deviceType !== 'sm') {
      const windowHeight = (window as any).innerHeight;
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
      this.checkHeightModalBody(data?.deviceType);
      this.changeDetector.markForCheck();
    });
  }

  public close(force = false): void {
    if (!force && !this.closeButton) {
      return;
    }
    this.modalContext?.destroy();
    this.modalContext?.instance?.closeHandler?.();
    this.modalContext = null;
    this.isOpen = false;
    if (this.html && this.body) {
      this.html.style.overflow = '';
      this.body.style.overflow = '';
    }
    this.changeDetector.detectChanges();
  }
}
