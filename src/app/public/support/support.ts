import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './support.html',
  styleUrl: './support.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class SupportPage {
  constructor() {
    document.title = "Support · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./support.logic'));
  }
}
