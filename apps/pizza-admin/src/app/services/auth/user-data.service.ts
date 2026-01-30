import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '@francesco-lucania-pizza-models';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private readonly userDataSubject = new BehaviorSubject<UserProfile | null>(
    null,
  );

  public readonly userData$: Observable<UserProfile | null> =
    this.userDataSubject.asObservable();

  public getUserData(): UserProfile | null {
    return this.userDataSubject.value;
  }

  public setUserData(userData: UserProfile | null): void {
    this.userDataSubject.next(userData);
  }
}
