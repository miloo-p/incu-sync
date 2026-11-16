import { TestBed } from '@angular/core/testing';

import { combinedGainDb } from '../calculations/filter-curve';
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

  it('knows when an ear has a hearing loss', () => {
    // Vorbereiten
    const before = service.hasHearingLoss();
    service.setChannel('left');

    // Ausführen
    service.updateValue(6, 10);

    // Prüfen
    expect(before).toBe(false);
    expect(service.hasHearingLoss()).toBe(true);
  });

  it('warns about the volume from a gain of 20 dB on', () => {
    // Ausführen: 38 dB HL at 1 kHz → POGO 19 dB
    service.updateValue(3, 38);
    const at19 = service.needsVolumeWarning();
    // 40 dB HL → POGO 20 dB
    service.updateValue(3, 40);
    const at20 = service.needsVolumeWarning();

    // Prüfen
    expect(at19).toBe(false);
    expect(at20).toBe(true);
  });

  it('recalculates the export config when the audiogram changes', () => {
    // Vorbereiten
    const before = service.exportConfig();

    // Ausführen: the right ear (active by default) gets 40 dB HL at 1 kHz
    service.updateValue(3, 40);
    const after = service.exportConfig();

    // Prüfen
    expect(before.preAmp).toBe(-1); // no gain yet, only the headroom
    expect(after.preAmp).toBe(-21); // POGO target 20 dB + 1 dB headroom
    expect(combinedGainDb(after.rightEar, 1000)).toBeCloseTo(20, 1);
    expect(after.leftEar.every((filter) => filter.gain === 0)).toBe(true);
    expect(before.volumeWarning).toBe(false);
    expect(after.volumeWarning).toBe(true); // 20 dB gain reaches the warning
  });
});
