import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './new-order.html',
  styleUrl: './new-order.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class NewOrderPage {
  constructor() {
    document.title = "New order · BeepBite";
    document.body.className = "l-restaurant";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./new-order.logic'));
  }
}
