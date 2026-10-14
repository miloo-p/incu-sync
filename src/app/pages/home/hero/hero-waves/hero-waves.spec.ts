import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroWaves } from './hero-waves';

describe('HeroWaves', () => {
  let component: HeroWaves;
  let fixture: ComponentFixture<HeroWaves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroWaves],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroWaves);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
