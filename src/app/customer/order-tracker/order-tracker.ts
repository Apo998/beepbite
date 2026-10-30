import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './order-tracker.html',
  styleUrl: './order-tracker.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class OrderTrackerPage {
  constructor() {
    document.title = "Your order · BeepBite";
    document.body.className = "l-customer";
    document.body.dataset['states'] = "loading:Loading,preparing:Preparing,ready:Ready,completed:Completed,missing:Not found";
    afterNextRender(() => import('./order-tracker.logic'));
  }
}
