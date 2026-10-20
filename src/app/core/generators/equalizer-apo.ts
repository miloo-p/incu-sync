import { ExportConfig, FilterConfig } from '../../models/interfaces';

export function buildEqualizerConfiguration(preset: ExportConfig): string {
  const leftFilters = buildFilterLines(preset.leftEar);
  const rightFilters = buildFilterLines(preset.rightEar);

  return `Preamp: ${Number(preset.preAmp.toFixed(1))} dB\nChannel: L\n${leftFilters}\nChannel: R\n${rightFilters}\n`;
}

function buildFilterLines(filters: FilterConfig[]): string {
  return filters
    .map((filter): string => {
      return `Filter: ON PK Fc ${Number(filter.frequency.toFixed(0))} Hz Gain ${Number(filter.gain.toFixed(1))} dB Q ${Number(filter.qFactor.toFixed(2))}`;
    })
    .join('\n');
}
