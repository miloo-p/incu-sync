import { FilterConfig } from '../../models/interfaces';

/**
 * How often `correctFilterGains` measures and readjusts. 50 rounds already get within 0.01 dB,
 * even when every filter wants 30 dB; 100 leave room and still take under a millisecond.
 */
const CORRECTION_ROUNDS = 100;

/**
 * Gain of a single peaking filter at any frequency.
 * Formula of the analog peaking filter from the Audio EQ Cookbook (Robert Bristow-Johnson),
 * which Equalizer APO's `PK` filters are built on. It needs no sample rate; the real digital
 * filters come out up to about 1 dB lower around 4–8 kHz, which is the safe direction.
 *
 * @param filter - The filter to look at.
 * @param frequency - Frequency in Hz.
 * @returns The gain of this filter at `frequency`, in dB.
 */
function peakingFilterDb(filter: FilterConfig, frequency: number): number {
  const amplitude = 10 ** (filter.gain / 40);
  const ratio = frequency / filter.frequency;
  // 0 exactly at the center frequency, growing the further away we are.
  const offCenter = (1 - ratio ** 2) ** 2;
  const numerator = offCenter + ((amplitude * ratio) / filter.qFactor) ** 2;
  const denominator = offCenter + (ratio / (amplitude * filter.qFactor)) ** 2;
  return 10 * Math.log10(numerator / denominator);
}

/**
 * Gain of all filters together at one frequency. The curves of the filters overlap,
 * and in dB they simply add up.
 *
 * @param filters - The filters of one ear.
 * @param frequency - Frequency in Hz.
 * @returns The combined gain in dB.
 */
export function combinedGainDb(filters: FilterConfig[], frequency: number): number {
  return filters.reduce((sum, filter) => sum + peakingFilterDb(filter, frequency), 0);
}

/**
 * Adjusts the filter gains so that all filters together hit their targets at the filter frequencies.
 * Without this, neighbouring filters add up and boost up to about 12 dB too much.
 * Each round measures the combined gain at every filter frequency and moves each gain
 * by the difference to its target. Gains may end up slightly negative: a small cut
 * cancels the spill-over from a strong neighbour.
 *
 * @param targets - One filter per frequency; its gain is the target, e.g. from POGO.
 * @returns New filters with the same frequency and Q but corrected gains. `targets` stays unchanged.
 */
export function correctFilterGains(targets: FilterConfig[]): FilterConfig[] {
  let filters = targets;
  for (let round = 0; round < CORRECTION_ROUNDS; round++) {
    // Inside map, `filters` is still last round's array, so the order of the filters doesn't matter.
    filters = filters.map((filter, i) => ({
      ...filter,
      gain: filter.gain + targets[i].gain - combinedGainDb(filters, filter.frequency),
    }));
  }
  return filters;
}
