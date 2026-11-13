import { calculatePogoGain } from './pogo';

describe('calculatePogoGain', () => {
  it('matches the POGO examples', () => {
    // Ausführen
    const at250 = calculatePogoGain(250, 15);
    const at500 = calculatePogoGain(500, 30);
    const at1000 = calculatePogoGain(1000, 15);
    const at4000 = calculatePogoGain(4000, 40);

    // Prüfen
    expect(at250).toBe(0); // 7.5 - 10 = -2.5, cut off at 0
    expect(at500).toBe(10); // 15 - 5
    expect(at1000).toBe(7.5); // 7.5 - 0
    expect(at4000).toBe(20); // 20 - 0
  });

  it('subtracts 10 dB at 125 Hz like at 250 Hz', () => {
    // Ausführen
    const result = calculatePogoGain(125, 40);

    // Prüfen
    expect(result).toBe(10); // 20 - 10
  });

  it('never returns a negative gain', () => {
    // Ausführen
    const result = calculatePogoGain(125, 0);

    // Prüfen
    expect(result).toBe(0); // 0 - 10 = -10, cut off at 0
  });

  it('caps the gain at 30 dB', () => {
    // Ausführen
    const result = calculatePogoGain(4000, 120);

    // Prüfen
    expect(result).toBe(30); // 60 - 0 = 60, cut off at 30
  });
});
