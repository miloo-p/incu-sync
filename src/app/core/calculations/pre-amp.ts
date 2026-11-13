/**
 * Calculates the pre-amp shared by both ears: the largest gain plus 1 dB headroom,
 * negative, rounded down to a whole dB. Rounding down only ever lowers the level,
 * so it can never cause clipping.
 *
 * @param gainsDb - The POGO gains of both ears together, so left and right keep their balance.
 * @returns The pre-amp in dB, always -1 or lower.
 */
export function calculatePreAmp(gainsDb: number[]): number {
  // The 0 keeps an empty list at -1 dB; Math.max() alone would return -Infinity.
  return Math.floor(-Math.max(0, ...gainsDb) - 1);
}
