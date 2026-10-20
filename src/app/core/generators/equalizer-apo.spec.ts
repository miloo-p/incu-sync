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

  it('builds a string for with both ears and two filters', () => {
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
});
