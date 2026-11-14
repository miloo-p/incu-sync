import { computed, Injectable, signal } from '@angular/core';
import { ExportConfig, FilterConfig } from '../../models/interfaces';
import { correctFilterGains } from '../calculations/filter-curve';
import { calculatePogoGain } from '../calculations/pogo';
import { calculatePreAmp } from '../calculations/pre-amp';

/** Q for filters one octave wide, matching the octave grid of `frequencies`. */
const OCTAVE_Q = 1.41;

/** Holds the audiogram both ears are edited in and which ear is currently active. */
@Injectable({
  providedIn: 'root',
})
export class EqCalc {
  /** The 7 standard audiometric frequencies in Hz (x-axis of the audiogram). */
  readonly frequencies = [125, 250, 500, 1000, 2000, 4000, 8000];

  /** Hearing threshold of the right ear in dB HL, one value per entry in `frequencies`. */
  readonly rightEarDb = signal([0, 0, 0, 0, 0, 0, 0]);
  /** Hearing threshold of the left ear in dB HL, one value per entry in `frequencies`. */
  readonly leftEarDb = signal([0, 0, 0, 0, 0, 0, 0]);

  /** The ear that inputs and drag handles currently edit. */
  readonly activeChannel = signal<'right' | 'left'>('right');

  /** True as soon as one ear has a threshold above 0 dB HL; until then there is nothing to export. */
  readonly hasHearingLoss = computed(() =>
    [...this.leftEarDb(), ...this.rightEarDb()].some((value) => value > 0),
  );

  /**
   * The Equalizer APO settings for the current audiogram. Recalculates by itself whenever an ear changes.
   * The pre-amp comes from the POGO targets, not from the corrected gains: those are smaller,
   * so the pre-amp would be too small and the curve could clip.
   */
  readonly exportConfig = computed((): ExportConfig => {
    const leftTargets = this.toPogoTargets(this.leftEarDb());
    const rightTargets = this.toPogoTargets(this.rightEarDb());
    return {
      preAmp: calculatePreAmp([...leftTargets, ...rightTargets].map((target) => target.gain)),
      leftEar: correctFilterGains(leftTargets),
      rightEar: correctFilterGains(rightTargets),
    };
  });

  /**
   * Switches which ear is edited.
   *
   * @param channel - The ear to edit from now on.
   */
  setChannel(channel: 'right' | 'left'): void {
    this.activeChannel.set(channel);
  }

  /**
   * Sets one threshold of the active ear.
   *
   * @param index - Position in `frequencies`.
   * @param newDbValue - New threshold in dB HL.
   */
  updateValue(index: number, newDbValue: number): void {
    const ear = this.activeChannel() === 'right' ? this.rightEarDb : this.leftEarDb;
    // A new array, not a changed one: a signal only notifies when its value is a different object.
    ear.update((values) => values.map((value, i) => (i === index ? newDbValue : value)));
  }

  /**
   * Turns the thresholds of one ear into one filter per frequency, with the POGO gain as its target.
   *
   * @param hearingLossDb - Thresholds in dB HL, one per entry in `frequencies`.
   * @returns One octave-wide filter per frequency.
   */
  private toPogoTargets(hearingLossDb: number[]): FilterConfig[] {
    return this.frequencies.map((frequency, i) => ({
      frequency,
      gain: calculatePogoGain(frequency, hearingLossDb[i]),
      qFactor: OCTAVE_Q,
    }));
  }
}
