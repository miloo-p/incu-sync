import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticleCanvas } from './particle-canvas';

describe('ParticleCanvas', () => {
  let component: ParticleCanvas;
  let fixture: ComponentFixture<ParticleCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticleCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticleCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
