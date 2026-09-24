import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { AppInterface } from './app-interface/app-interface';
import { ShareStory } from './share-story/share-story';
import { Thanks } from './thanks/thanks';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, AppInterface, ShareStory, Thanks],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
