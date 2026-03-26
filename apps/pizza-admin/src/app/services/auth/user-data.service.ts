import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '@francesco-lucania-pizza-models';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly platformService = inject(PlatformService);
  private readonly userDataSubject = new BehaviorSubject<
    UserProfile | null | undefined
  >(
    // На сервере всегда null, на клиенте undefined (данные еще не загружены)
    this.platformService.isBrowser() ? undefined : null,
  );

  public readonly userData$: Observable<UserProfile | null | undefined> =
    this.userDataSubject.asObservable();

  public getUserData(): UserProfile | null | undefined {
    return this.userDataSubject.value;
  }

  public setUserData(userData: UserProfile | null | undefined): void {
    console.log('setUserData', userData);
    this.userDataSubject.next(userData);
  }
}
