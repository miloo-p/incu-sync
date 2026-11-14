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

  it('disables the button when the parent sets disabled', async () => {
    // Vorbereiten
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const enabledBefore = !button.disabled;

    // Ausführen
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    // Prüfen
    expect(enabledBefore).toBe(true);
    expect(button.disabled).toBe(true);
  });
});
