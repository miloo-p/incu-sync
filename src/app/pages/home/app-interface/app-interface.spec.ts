import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInterface } from './app-interface';

describe('AppInterface', () => {
  let component: AppInterface;
  let fixture: ComponentFixture<AppInterface>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppInterface],
    }).compileComponents();

    fixture = TestBed.createComponent(AppInterface);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
