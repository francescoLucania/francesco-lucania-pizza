import { InjectionToken } from '@angular/core';

export const MEDIA_QUERY_CONFIG = new InjectionToken<IMediaQueriesParams>(
  'mediaQueriesConfig'
);

export interface IMediaQueriesParams {
  enable: {
    mq: boolean;
    mqDevice: boolean;
  };
  mqBreakpoints?: TMediaQueriesBreakpoint[];
}

export type TMediaQueriesBreakpoint = [string, number];

export interface IMediaQueriesDeviceInfo {
  deviceType: string;
  deviceSize: {
    size: string;
    mq: {
      sm: false;
      md: true;
      lg: false;
    };
    width: number;
  };
}

export interface IMediaQueriesBreakpoint {
  int: number;
  str: string;
}
