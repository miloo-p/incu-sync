import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EqCalc {
  // Die 7 genormten Frequenzbänder (X-Achse)
  readonly frequencies = [125, 250, 500, 1000, 2000, 4000, 8000];

  // State für die Audiogramm-Werte
  rightEarDb = [0, 0, 0, 0, 0, 0, 0];
  leftEarDb = [0, 0, 0, 0, 0, 0, 0];

  // Welcher Kanal wird gerade bearbeitet?
  activeChannel: 'right' | 'left' = 'right';

  setChannel(channel: 'right' | 'left') {
    this.activeChannel = channel;
  }

  updateValue(index: number, newDbValue: number) {
    if (this.activeChannel === 'right') {
      this.rightEarDb[index] = newDbValue;
    } else {
      this.leftEarDb[index] = newDbValue;
    }
  }
}
