import { FilterConfig } from '../../models/interfaces';
import { combinedGainDb, correctFilterGains } from './filter-curve';

describe('combinedGainDb', () => {
  it('is the full gain at the center frequency', () => {
    // Vorbereiten
    const filters: FilterConfig[] = [{ frequency: 1000, gain: 6, qFactor: 1.41 }];

    // Ausführen
    const result = combinedGainDb(filters, 1000);

    // Prüfen
    expect(result).toBeCloseTo(6);
  });

  it('is half the gain half an octave away', () => {
    // Vorbereiten: Q = √2 means exactly one octave wide
    const filters: FilterConfig[] = [{ frequency: 1000, gain: 6, qFactor: Math.SQRT2 }];

    // Ausführen
    const above = combinedGainDb(filters, 1000 * Math.SQRT2);
    const below = combinedGainDb(filters, 1000 / Math.SQRT2);

    // Prüfen
    expect(above).toBeCloseTo(3);
    expect(below).toBeCloseTo(3);
  });

  it('adds up overlapping filters', () => {
    // Vorbereiten
    const filters: FilterConfig[] = [
      { frequency: 1000, gain: 20, qFactor: 1.41 },
      { frequency: 2000, gain: 20, qFactor: 1.41 },
    ];

    // Ausführen
    const result = combinedGainDb(filters, 1000);

    // Prüfen
    expect(result).toBeCloseTo(25, 1); // 20 of its own + 5 from the 2 kHz neighbour
  });
});

describe('correctFilterGains', () => {
  // POGO targets for a sloping hearing loss of 0/0/10/20/40/60/60 dB HL
  const targets: FilterConfig[] = [
    { frequency: 125, gain: 0, qFactor: 1.41 },
    { frequency: 250, gain: 0, qFactor: 1.41 },
    { frequency: 500, gain: 0, qFactor: 1.41 },
    { frequency: 1000, gain: 10, qFactor: 1.41 },
    { frequency: 2000, gain: 20, qFactor: 1.41 },
    { frequency: 4000, gain: 30, qFactor: 1.41 },
    { frequency: 8000, gain: 30, qFactor: 1.41 },
  ];

  it('makes the filters together reach the target at every filter frequency', () => {
    // Ausführen
    const corrected = correctFilterGains(targets);

    // Prüfen
    for (const target of targets) {
      expect(combinedGainDb(corrected, target.frequency)).toBeCloseTo(target.gain, 1);
    }
  });

  it('does not change the targets it gets', () => {
    // Vorbereiten
    const before = targets.map((target) => ({ ...target }));

    // Ausführen
    correctFilterGains(targets);

    // Prüfen
    expect(targets).toEqual(before);
  });
});
