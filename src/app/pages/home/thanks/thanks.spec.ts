import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thanks } from './thanks';

describe('Thanks', () => {
  let component: Thanks;
  let fixture: ComponentFixture<Thanks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thanks],
    }).compileComponents();

    fixture = TestBed.createComponent(Thanks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
