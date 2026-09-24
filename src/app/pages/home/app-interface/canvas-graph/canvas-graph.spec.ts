import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasGraph } from './canvas-graph';

describe('CanvasGraph', () => {
  let component: CanvasGraph;
  let fixture: ComponentFixture<CanvasGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasGraph],
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
