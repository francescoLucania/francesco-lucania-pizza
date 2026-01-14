import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface PopoverData {
  event?: Event;
  title?: string | null;
  gutter?: string | null;
  width?: string | null;
  positionType?: 'top' | 'bottom' | null;
  type?: string | null;
  component?: any;
  context?: any;
  isHide?: boolean;
  closeButton: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PopoverService {
  public popoverSequence$: Subject<PopoverData | null> = new Subject();
  private popoverEvent$$: Subject<any> = new Subject();

  public open(event: any, popoverData: PopoverData) {
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
