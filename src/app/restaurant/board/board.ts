import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './board.html',
  styleUrl: './board.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class BoardPage {
  constructor() {
    document.title = "Order board · BeepBite";
    document.body.className = "l-restaurant";
    document.body.dataset['states'] = "default:Today's orders,loading:Loading";
    afterNextRender(() => import('./board.logic'));
  }
}
