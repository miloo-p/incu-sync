import { ExportConfig, FilterConfig } from '../../models/interfaces';

/**
 * Comment line for strong boosts. Equalizer APO ignores lines starting with `#`,
 * so it is only read by people opening the file.
 */
const VOLUME_WARNING_LINE =
  '# Hinweis: Bei hohen dB-Werten muss die Lautstärke angepasst werden. Vor der Nutzung also herunterdrehen und langsam auf ein angenehmes Level bringen. Der Pre-Amp hilft dabei nur gegen das Übersteuern. Eine Lautstärkeanpassung muss händisch geschehen.\n';

/**
 * Builds the text of an Equalizer APO `config.txt`: an optional volume warning,
 * the shared pre-amp, then `Channel: L` and `Channel: R`, each followed by its filter lines.
 * Numbers are rounded for readability and every line ends with `\n`.
 *
 * @param preset - Pre-amp, volume warning and filters for both ears.
 * @returns The complete file content, ready to download.
 */
export function buildEqualizerConfiguration(preset: ExportConfig): string {
  const warning = preset.volumeWarning ? VOLUME_WARNING_LINE : '';
  const leftFilters = buildFilterLines(preset.leftEar);
  const rightFilters = buildFilterLines(preset.rightEar);

  return `${warning}Preamp: ${Number(preset.preAmp.toFixed(1))} dB\nChannel: L\n${leftFilters}Channel: R\n${rightFilters}`;
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
