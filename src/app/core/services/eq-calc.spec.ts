import { TestBed } from '@angular/core/testing';

import { EqCalc } from './eq-calc';

describe('EqCalc', () => {
  let service: EqCalc;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EqCalc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('updates only the active ear and gives it a new array', () => {
    // Vorbereiten
    const leftBefore = service.leftEarDb();
    service.setChannel('left');

    // Ausführen
    service.updateValue(2, 40);

    // Prüfen
    expect(service.leftEarDb()).toEqual([0, 0, 40, 0, 0, 0, 0]);
    expect(service.leftEarDb()).not.toBe(leftBefore);
    expect(service.rightEarDb()).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
