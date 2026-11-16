/** Content of a single card in the features section. */
export interface FeatureItem {
  title: string;
  description: string;
  imagePath: string;
}

/**
 * One point of the EQ curve. The Equalizer APO export writes it as a `frequency gain` pair
 * in the `GraphicEQ:` line; `qFactor` is only needed when it is used as a peaking filter (A/B player).
 */
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
  /** True if the boost is strong enough that the export should carry a volume warning. */
  volumeWarning: boolean;
  /** Curve points for the left ear, sorted by frequency. Together they form its `GraphicEQ:` line. */
  leftEar: FilterConfig[];
  /** Curve points for the right ear, sorted by frequency. Together they form its `GraphicEQ:` line. */
  rightEar: FilterConfig[];
}
