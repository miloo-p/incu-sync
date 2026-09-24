import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportBtn } from './export-btn';

describe('ExportBtn', () => {
  let component: ExportBtn;
  let fixture: ComponentFixture<ExportBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
