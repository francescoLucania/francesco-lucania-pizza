import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  IMediaQueriesBreakpoint,
  IMediaQueriesDeviceInfo,
  IMediaQueriesParams,
  MEDIA_QUERY_CONFIG,
  TMediaQueriesBreakpoint,
} from './models/media-queries.interface';
import { BrowserService } from '../browser/browser.service';

export const MEDIA_QUERY_CONFIG_BASE: IMediaQueriesParams = {
  enable: {
    mq: true,
    mqDevice: false,
  },
  mqBreakpoints: [
    ['sm', 767], // max-width
    ['md', 768], // min-width
    ['lg', 1140], // min-width
  ],
};

@Injectable({
  providedIn: 'root',
})
export class MediaQueriesService {
  private _deviceType$ = new BehaviorSubject<IMediaQueriesDeviceInfo | null>(
    null
  );
  public deviceType$ = this._deviceType$.asObservable();

  private _deviceTypeParams: any;

  private _windowResize$: Observable<Event>;

  private _mq: { [key: string]: IMediaQueriesBreakpoint } = {};
  private _mqParams = {};

  constructor(
    @Optional() @Inject(MEDIA_QUERY_CONFIG) private config: IMediaQueriesParams,
    private browserService: BrowserService
  ) {
    if (!this.config) {
      this.config = MEDIA_QUERY_CONFIG_BASE;
    }

    if (browserService.isBrowser) {
      this._windowResize$ = fromEvent(window, 'resize');
    }

    this.init();
    this._windowResize$?.pipe(debounceTime(800)).subscribe(() => this.init());
  }

  private init(): void {
    this._deviceTypeParams = {
      deviceType: this.getType(),
      deviceSize: this.getDeviceSizeData(),
    };
    this._deviceType$.next(this._deviceTypeParams);
  }

  private createMq(array: TMediaQueriesBreakpoint[] | undefined): void {
    const mqDevice = this.config.enable.mqDevice ? 'device-' : '';

    array?.forEach((element, index: number) => {
      const mqRange = index === 0 ? 'max' : 'min';
      const key = element[0];
      this._mq[key] = {
        int: element[1],
        str: '(' + mqRange + '-' + mqDevice + 'width: ' + element[1] + 'px)',
      };
    });
  }

  public getType(): string {
    this.createMq(this.config.mqBreakpoints);
    let displayWidthType = '';

    if (this.browserService.isBrowser) {
      for (const item in this._mq) {
        if (window.matchMedia(this._mq[item].str).matches) {
          displayWidthType = item;
        }
      }
    }
    return displayWidthType;
  }

  public getDeviceSizeData(): { size: string; mq: any; width: number } {
    this.createMq(this.config.mqBreakpoints);

    let resultSize = '';

    if (this.browserService.isBrowser) {
      Object.keys(this._mq).forEach((key) => {
        // @ts-ignore
        this._mqParams[key] = window.matchMedia(this._mq[key].str).matches;
        // @ts-ignore
        if (this._mqParams[key]) {
          resultSize = key;
        }
      });
    }

    return {
      size: resultSize,
      mq: this._mqParams,
      width: this.browserService.isBrowser ? (window as any).innerWidth : null,
    };
  }

  public getDeviceParams(): string {
    return this._deviceTypeParams;
  }
}
