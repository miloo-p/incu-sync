import { Component, input } from '@angular/core';
import { FeatureItem } from '../../../../models/interfaces';

@Component({
  selector: 'app-feature-card',
  imports: [],
  templateUrl: './feature-card.html',
  styleUrl: './feature-card.scss',
})
export class FeatureCard {
  feature = input.required<FeatureItem>();
}
