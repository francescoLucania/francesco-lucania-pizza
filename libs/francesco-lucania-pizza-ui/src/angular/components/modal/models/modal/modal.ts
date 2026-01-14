import { NgModuleRef, Type } from '@angular/core';

export interface IModalContext {
  closable?: boolean;
  backgroundClick?: boolean;
  closeModal?: () => void;
  title?: string;
  content?: unknown;
  closeHandler?: () => void;
  [key: string]: unknown;
}

export interface IModalDataInterface {
  component: Type<unknown>;
  moduleRef?: NgModuleRef<unknown>;
  context?: IModalContext;
}
