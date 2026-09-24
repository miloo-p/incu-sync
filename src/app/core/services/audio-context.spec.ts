import { TestBed } from '@angular/core/testing';

import { AudioContext } from './audio-context';

describe('AudioContext', () => {
  let service: AudioContext;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioContext);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
