import { NgModuleRef, Type } from '@angular/core';

export interface IModalDataInterface {
  component: Type<any>;
  moduleRef?: NgModuleRef<any>;
  context?: any;
}
