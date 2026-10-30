import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './ready.html',
  styleUrl: './ready.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class ReadyPage {
  constructor() {
    document.title = "Ready for pickup · BeepBite";
    document.body.className = "l-customer";
    document.body.dataset['states'] = "default:Ready,loading:Loading";
    afterNextRender(() => import('./ready.logic'));
  }
}
