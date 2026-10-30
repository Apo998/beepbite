import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './history.html',
  styleUrl: './history.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class HistoryPage {
  constructor() {
    document.title = "Your orders · BeepBite";
    document.body.className = "l-customer";
    document.body.dataset['states'] = "default:All orders,loading:Loading";
    afterNextRender(() => import('./history.logic'));
  }
}
