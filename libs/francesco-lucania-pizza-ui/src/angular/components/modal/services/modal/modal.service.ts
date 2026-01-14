import { Injectable, NgModuleRef, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IModalDataInterface } from '../../models/modal/modal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  public get modalState$(): Observable<IModalDataInterface | null> {
    return this._modalState$.asObservable();
  }
  private _modalState$ = new Subject<IModalDataInterface | null>();
  constructor() {}

  public open(
    component: Type<any>,
    moduleRef?: NgModuleRef<any>,
    context?: any
  ): void {
    const baseContext = {
      closable: true,
      backgroundClick: true,
      closeModal: () => this.close(), // стандартный метод закрытия окна из его контента
    };

    if (context) {
      Object.assign(baseContext, context);
    }

    const modalData: IModalDataInterface = {
      component,
      moduleRef,
      context: baseContext,
    };

    this.close();
    this._modalState$.next(modalData);
  }

  public close(): void {
    this._modalState$.next(null);
  }
}
