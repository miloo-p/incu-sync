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
      imagePath: '',
    },
    {
      title: 'Left & Right Ear',
      description:
        'Each ear is calibrated separately, so the correction matches your hearing on both sides.',
      imagePath: '',
    },
    {
      title: 'A/B Comparison',
      description:
        'Switch between the original and the corrected sound instantly to hear the difference.',
      imagePath: '',
    },
    {
      title: 'Equalizer APO Export',
      description:
        'Download a ready-to-use configuration file and load it straight into Equalizer APO.',
      imagePath: '',
    },
  ];
}
