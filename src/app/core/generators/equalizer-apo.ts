import { ExportConfig, FilterConfig } from '../../models/interfaces';

/**
 * Comment line for strong boosts. Equalizer APO ignores lines starting with `#`,
 * so it is only read by people opening the file.
 */
const VOLUME_WARNING_LINE =
  '# Hinweis: Bei hohen dB-Werten muss die Lautstärke angepasst werden. Vor der Nutzung also herunterdrehen und langsam auf ein angenehmes Level bringen. Der Pre-Amp hilft dabei nur gegen das Übersteuern. Eine Lautstärkeanpassung muss händisch geschehen.\n';

/**
 * Builds the text of an Equalizer APO `config.txt`: an optional volume warning,
 * the shared pre-amp, then `Channel: L` and `Channel: R`, each followed by its `GraphicEQ:` line.
 * Numbers are rounded for readability and every line ends with `\n`.
 *
 * @param preset - Pre-amp, volume warning and curve points for both ears.
 * @returns The complete file content, ready to download.
 */
export function buildEqualizerConfiguration(preset: ExportConfig): string {
  const warning = preset.volumeWarning ? VOLUME_WARNING_LINE : '';
  const leftCurve = buildGraphicEqLine(preset.leftEar);
  const rightCurve = buildGraphicEqLine(preset.rightEar);

  return `${warning}Preamp: ${Number(preset.preAmp.toFixed(1))} dB\nChannel: L\n${leftCurve}Channel: R\n${rightCurve}`;
}

/**
 * Turns the points of one ear into a single `GraphicEQ: 125 0; 250 5; …` line.
 * GraphicEQ continues its last gain flat up to 20 kHz, so a closing point one octave
 * above the highest frequency lets the boost fall back to 0 dB instead.
 * An empty list adds nothing, not even an empty line.
 *
 * @param filters - The curve points of one ear, sorted by frequency.
 * @returns The `GraphicEQ:` line, or an empty string if there are no points.
 */
function buildGraphicEqLine(filters: FilterConfig[]): string {
  if (filters.length === 0) {
    return '';
  }
  const points = filters.map(
    (filter) => `${Number(filter.frequency.toFixed(0))} ${Number(filter.gain.toFixed(1))}`,
  );
  const closingFrequency = filters[filters.length - 1].frequency * 2;
  return `GraphicEQ: ${points.join('; ')}; ${Number(closingFrequency.toFixed(0))} 0\n`;
}
