import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbPlayer } from './ab-player';

describe('AbPlayer', () => {
  let component: AbPlayer;
  let fixture: ComponentFixture<AbPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(AbPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
