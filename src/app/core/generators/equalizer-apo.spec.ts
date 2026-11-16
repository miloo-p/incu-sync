import { buildEqualizerConfiguration } from './equalizer-apo';
import { ExportConfig } from '../../models/interfaces';

describe('buildEqualizerConfiguration', () => {
  it('builds a string with both ears', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -7,
      volumeWarning: false,
      leftEar: [{ frequency: 125, gain: 3, qFactor: 1.41 }],
      rightEar: [{ frequency: 125, gain: 2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -7 dB\nChannel: L\nGraphicEQ: 125 3; 250 0\nChannel: R\nGraphicEQ: 125 2; 250 0\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('builds a string for both ears and two filters', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -7,
      volumeWarning: false,
      leftEar: [
        { frequency: 125, gain: 3, qFactor: 1.41 },
        { frequency: 250, gain: 5, qFactor: 1.41 },
      ],
      rightEar: [{ frequency: 125, gain: 2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -7 dB\nChannel: L\nGraphicEQ: 125 3; 250 5; 500 0\nChannel: R\nGraphicEQ: 125 2; 250 0\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('builds a string for both ears and two filters with weird numbers ', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -30.900000000000002,
      volumeWarning: false,
      leftEar: [{ frequency: 1000.4, gain: 29.900000000000002, qFactor: Math.sqrt(2) }],
      rightEar: [{ frequency: 125, gain: 0.1 + 0.2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: -30.9 dB\nChannel: L\nGraphicEQ: 1000 29.9; 2001 0\nChannel: R\nGraphicEQ: 125 0.3; 250 0\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('proves that preAmp and gain will not be -0', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -0.04,
      volumeWarning: false,
      leftEar: [{ frequency: 1000.4, gain: -0.002, qFactor: Math.sqrt(2) }],
      rightEar: [{ frequency: 125, gain: 0.1 + 0.2, qFactor: 1.41 }],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);
    const expected =
      'Preamp: 0 dB\nChannel: L\nGraphicEQ: 1000 0; 2001 0\nChannel: R\nGraphicEQ: 125 0.3; 250 0\n';

    // Prüfen
    expect(result).toBe(expected);
  });

  it('writes the channel without an empty line when an ear has no filters', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -7,
      volumeWarning: false,
      leftEar: [{ frequency: 125, gain: 3, qFactor: 1.41 }],
      rightEar: [],
    };
    const expected = 'Preamp: -7 dB\nChannel: L\nGraphicEQ: 125 3; 250 0\nChannel: R\n';

    // Ausführen
    const result = buildEqualizerConfiguration(example);

    // Prüfen
    expect(result).toBe(expected);
  });

  it('puts the volume warning as a comment line above everything else', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -21,
      volumeWarning: true,
      leftEar: [{ frequency: 1000, gain: 20, qFactor: 1.41 }],
      rightEar: [],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);

    // Prüfen: one `#` line, then the config exactly as without the warning
    expect(result).toMatch(
      /^# [^\n]+\nPreamp: -21 dB\nChannel: L\nGraphicEQ: 1000 20; 2000 0\nChannel: R\n$/,
    );
  });

  it('lets the curve fall back to 0 dB one octave above the highest point', () => {
    // Vorbereiten
    const example: ExportConfig = {
      preAmp: -31,
      volumeWarning: true,
      leftEar: [
        { frequency: 4000, gain: 30, qFactor: 1.41 },
        { frequency: 8000, gain: 30, qFactor: 1.41 },
      ],
      rightEar: [],
    };

    // Ausführen
    const result = buildEqualizerConfiguration(example);

    // Prüfen: without the 16000 point, GraphicEQ would keep 30 dB up to 20 kHz
    expect(result).toContain('GraphicEQ: 4000 30; 8000 30; 16000 0\n');
  });
});
