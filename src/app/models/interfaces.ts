import { EqCalc } from '../core/services/eq-calc';

/** Content of a single card in the features section. */
export interface FeatureItem {
  title: string;
  description: string;
  imagePath: string;
}

/** One peaking filter, written as one `Filter:` line in the Equalizer APO export. */
export interface FilterConfig {
  /** Frequency given as Hz */
  frequency: number;
  /** Gain given as dB */
  gain: number;
  /** Width of the filter. Higher values = narrower band. */
  qFactor: number;
}

/** Everything needed to generate an Equalizer APO config: shared pre-amp plus filters per ear. */
export interface ExportConfig {
  /** Pre-amp in dB, shared by both ears. Always negative: it lowers the overall level so the boosting filters can't clip. */
  preAmp: number;
  /** Filters for the left ear. One entry = one `Filter:` line in the export. */
  leftEar: FilterConfig[];
  /** Filters for the right ear. One entry = one `Filter:` line in the export. */
  rightEar: FilterConfig[];
}
