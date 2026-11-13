import { Injectable, signal } from '@angular/core';

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
}
