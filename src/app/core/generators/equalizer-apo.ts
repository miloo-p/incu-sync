import { ExportConfig, FilterConfig } from '../../models/interfaces';

/**
 * Builds the text of an Equalizer APO `config.txt`: the shared pre-amp first,
 * then `Channel: L` and `Channel: R`, each followed by its filter lines.
 * Numbers are rounded for readability and every line ends with `\n`.
 *
 * @param preset - Pre-amp and filters for both ears.
 * @returns The complete file content, ready to download.
 */
export function buildEqualizerConfiguration(preset: ExportConfig): string {
  const leftFilters = buildFilterLines(preset.leftEar);
  const rightFilters = buildFilterLines(preset.rightEar);

  return `Preamp: ${Number(preset.preAmp.toFixed(1))} dB\nChannel: L\n${leftFilters}Channel: R\n${rightFilters}`;
}

/**
 * Turns a list of filters into `Filter: ON PK …` lines.
 * Every line ends with `\n`, so an empty list adds nothing, not even an empty line.
 *
 * @param filters - The filters of one ear.
 * @returns One line per filter, or an empty string if there are none.
 */
function buildFilterLines(filters: FilterConfig[]): string {
  return filters
    .map((filter): string => {
      return `Filter: ON PK Fc ${Number(filter.frequency.toFixed(0))} Hz Gain ${Number(filter.gain.toFixed(1))} dB Q ${Number(filter.qFactor.toFixed(2))}\n`;
    })
    .join('');
}
