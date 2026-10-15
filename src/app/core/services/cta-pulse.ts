import { Injectable, signal } from '@angular/core';

/** Broadcasts the hero CTA pulse, so other animations (e.g. the particle canvas) can react to it. */
@Injectable({
  providedIn: 'root',
})
export class CtaPulse {
  /** Number of pulses sent so far; every change is one new pulse. */
  readonly count = signal(0);

  /** Sends a new pulse. */
  trigger(): void {
    this.count.update((n) => n + 1);
  }
}
