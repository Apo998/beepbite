import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class OrderDetailPage {
  constructor() {
    document.title = "Order detail · BeepBite";
    document.body.className = "l-restaurant";
    document.body.dataset['states'] = "preparing:Preparing,ready:Ready,completed:Completed,missing:Not found";
    afterNextRender(() => import('./order-detail.logic'));
  }
}
