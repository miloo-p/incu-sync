import { ExportConfig, FilterConfig } from '../../models/interfaces';

export function buildEqualizerConfiguration(preset: ExportConfig): string {
  const leftFilters = buildFilterLines(preset.leftEar);
  const rightFilters = buildFilterLines(preset.rightEar);

  return `Preamp: ${preset.preAmp} dB\nChannel: L\n${leftFilters}\nChannel: R\n${rightFilters}\n`;
}

function buildFilterLines(filters: FilterConfig[]): string {
  return filters
    .map((filter): string => {
      return `Filter: ON PK Fc ${filter.frequency} Hz Gain ${filter.gain} dB Q ${filter.qFactor}`;
    })
    .join('\n');
}
