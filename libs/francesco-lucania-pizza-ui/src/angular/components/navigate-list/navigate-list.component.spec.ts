import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigateListComponent } from './navigate-list.component';

describe('NavigateListComponent', () => {
  let component: NavigateListComponent;
  let fixture: ComponentFixture<NavigateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavigateListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
