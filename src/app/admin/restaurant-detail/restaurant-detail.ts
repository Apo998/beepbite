import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './restaurant-detail.html',
  styleUrl: './restaurant-detail.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class RestaurantDetailPage {
  constructor() {
    document.title = "Restaurant · BeepBite admin";
    document.body.className = "l-admin";
    document.body.dataset['states'] = "default:Restaurant,missing:Not found";
    afterNextRender(() => import('./restaurant-detail.logic'));
  }
}
