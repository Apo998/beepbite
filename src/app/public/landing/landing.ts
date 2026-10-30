import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class LandingPage {
  constructor() {
    document.title = "BeepBite · Hear it. Then eat it.";
    document.body.className = "";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./landing.logic'));
  }
}
