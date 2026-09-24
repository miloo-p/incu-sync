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
});
