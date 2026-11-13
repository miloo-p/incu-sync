import { calculatePreAmp } from './pre-amp';

describe('calculatePreAmp', () => {
  it('lowers the level by the largest gain of both ears plus 1 dB', () => {
    // Vorbereiten
    const leftGains = [0, 10, 7.5];
    const rightGains = [20, 5];

    // Ausführen
    const result = calculatePreAmp([...leftGains, ...rightGains]);

    // Prüfen
    expect(result).toBe(-21); // -20 - 1
  });

  it('rounds down to a whole dB', () => {
    // Ausführen
    const result = calculatePreAmp([29.4, 3]);

    // Prüfen
    expect(result).toBe(-31); // -29.4 - 1 = -30.4, rounded down
  });

  it('stays at -1 dB when there are no gains', () => {
    // Ausführen
    const result = calculatePreAmp([]);

    // Prüfen
    expect(result).toBe(-1); // only the headroom
  });
});
