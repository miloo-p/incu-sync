import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Stories } from './pages/stories/stories';
import { Imprint } from './legal/imprint/imprint';
import { LegalNotice } from './legal/legal-notice/legal-notice';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'stories',
    component: Stories,
  },
  {
    path: 'imprint',
    component: Imprint,
  },
  {
    path: 'legal-notice',
    component: LegalNotice,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
