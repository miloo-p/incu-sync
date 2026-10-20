import { buildEqualizerConfiguration } from './equalizer-apo';
import { ExportConfig } from '../../models/interfaces';

describe('buildEqualizerConfiguration', () => {
  it('builds a string with both ears', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -7,
      leftEar: [{ frequency: 125, gain: 3, qFactor: 1.41 }],
      rightEar: [{ frequency: 125, gain: 2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -7 dB\nChannel: L\nFilter: ON PK Fc 125 Hz Gain 3 dB Q 1.41\nChannel: R\nFilter: ON PK Fc 125 Hz Gain 2 dB Q 1.41\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('builds a string for both ears and two filters', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -7,
      leftEar: [
        { frequency: 125, gain: 3, qFactor: 1.41 },
        { frequency: 250, gain: 5, qFactor: 1.41 },
      ],
      rightEar: [{ frequency: 125, gain: 2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -7 dB\nChannel: L\nFilter: ON PK Fc 125 Hz Gain 3 dB Q 1.41\nFilter: ON PK Fc 250 Hz Gain 5 dB Q 1.41\nChannel: R\nFilter: ON PK Fc 125 Hz Gain 2 dB Q 1.41\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('builds a string for both ears and two filters with weird numbers ', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -30.900000000000002,
      leftEar: [{ frequency: 1000.4, gain: 29.900000000000002, qFactor: Math.sqrt(2) }],
      rightEar: [{ frequency: 125, gain: 0.1 + 0.2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -30.9 dB\nChannel: L\nFilter: ON PK Fc 1000 Hz Gain 29.9 dB Q 1.41\nChannel: R\nFilter: ON PK Fc 125 Hz Gain 0.3 dB Q 1.41\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('proves that preAmp and gain will not be -0', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -0.04,
      leftEar: [{ frequency: 1000.4, gain: -0.002, qFactor: Math.sqrt(2) }],
      rightEar: [{ frequency: 125, gain: 0.1 + 0.2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: 0 dB\nChannel: L\nFilter: ON PK Fc 1000 Hz Gain 0 dB Q 1.41\nChannel: R\nFilter: ON PK Fc 125 Hz Gain 0.3 dB Q 1.41\n';

    // Prüfen
    expect(result).toBe(expected);
  });
});
