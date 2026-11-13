/**
 * POGO bass corrections in dB, by frequency in Hz. Every other frequency gets 0.
 * POGO itself names no value for 125 Hz; -10 dB like at 250 Hz is our own assumption.
 */
const BASS_CORRECTION_DB: Record<number, number> = { 125: -10, 250: -10, 500: -5 };

/**
 * Largest boost per frequency in dB. Above this, headphones start to distort,
 * and a hearing aid is the better solution anyway.
 */
const MAX_GAIN_DB = 30;

/**
 * Calculates the boost for one frequency with the POGO formula
 * (McCandless & Lyregaard 1983): half the hearing loss, less in the bass.
 * The result is never negative, because the EQ only boosts and never cuts,
 * and never above `MAX_GAIN_DB`.
 *
 * @param frequency - Frequency in Hz.
 * @param hearingLossDb - Hearing threshold in dB HL (air conduction).
 * @returns The gain in dB, between 0 and 30.
 */
export function calculatePogoGain(frequency: number, hearingLossDb: number): number {
  const correction = BASS_CORRECTION_DB[frequency] ?? 0;
  return Math.min(MAX_GAIN_DB, Math.max(0, 0.5 * hearingLossDb + correction));
}
