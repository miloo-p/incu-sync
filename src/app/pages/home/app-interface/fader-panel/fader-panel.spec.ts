import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaderPanel } from './fader-panel';

describe('FaderPanel', () => {
  let component: FaderPanel;
  let fixture: ComponentFixture<FaderPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaderPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(FaderPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
