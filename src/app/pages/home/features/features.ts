import { Component } from '@angular/core';
import { FeatureCard } from './feature-card/feature-card';
import { FeatureItem } from '../../../models/interfaces';

@Component({
  selector: 'app-features',
  imports: [FeatureCard],
  templateUrl: './features.html',
  styleUrl: './features.scss',
})
export class Features {
  displayFeatures: FeatureItem[] = [
    {
      title: 'Audiogram Input',
      description:
        'Enter your hearing test results per frequency band - by dragging the curve or typing exact dB values.',
      imagePath: 'assets/images/feature-cards/01-audiogram-input.svg',
    },
    {
      title: 'Left & Right Ear',
      description:
        'Each ear is calibrated separately, so the correction matches your hearing on both sides.',
      imagePath: 'assets/images/feature-cards/02-left-right-ear.svg',
    },
    {
      title: 'A/B Comparison',
      description:
        'Switch between the original and the corrected sound instantly to hear the difference.',
      imagePath: 'assets/images/feature-cards/03-ab-comparison.svg',
    },
    {
      title: 'Equalizer APO Export',
      description:
        'Download a ready-to-use configuration file and load it straight into Equalizer APO.',
      imagePath: 'assets/images/feature-cards/04-equalizer-apo-export.svg',
    },
  ];
}
