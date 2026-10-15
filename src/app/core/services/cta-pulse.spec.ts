import { TestBed } from '@angular/core/testing';

import { CtaPulse } from './cta-pulse';

describe('CtaPulse', () => {
  let service: CtaPulse;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CtaPulse);
  });

  it('should count every pulse', () => {
    service.trigger();
    service.trigger();
    expect(service.count()).toBe(2);
  });
});
