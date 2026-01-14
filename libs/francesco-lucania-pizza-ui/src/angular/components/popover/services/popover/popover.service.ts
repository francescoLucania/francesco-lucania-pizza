import { Injectable, Type } from '@angular/core';
import { Subject } from 'rxjs';

export interface PopoverContext {
  content?: unknown;
  [key: string]: unknown;
}

export interface PopoverData {
  event?: Event | HTMLElement;
  title?: string | null;
  gutter?: string | null;
  width?: string | null;
  positionType?: 'top' | 'bottom' | null;
  type?: string | null;
  component?: Type<unknown>;
  context?: PopoverContext;
  isHide?: boolean;
  closeButton: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PopoverService {
  public popoverSequence$: Subject<PopoverData | null> = new Subject();
  private popoverEvent$$: Subject<Event | HTMLElement> = new Subject();

  public open(event: Event | HTMLElement, popoverData: PopoverData) {
    this.popoverSequence$.next(popoverData);
    this.popoverEvent$$.next(event);
  }

  public selected() {
    this.popoverSequence$.next(null);
  }

  public close() {
    this.popoverSequence$.next(null);
  }
}
