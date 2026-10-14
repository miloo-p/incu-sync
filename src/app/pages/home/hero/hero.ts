import { Component, signal } from '@angular/core';
import { HeroWaves } from './hero-waves/hero-waves';

/** Landing hero with headline, CTA and an animated sound-wave background. */
@Component({
  selector: 'app-hero',
  imports: [HeroWaves],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  /** Whether the CTA is hovered or focused; drives the wave highlight and pulse. */
  protected readonly ctaActive = signal(false);
}
