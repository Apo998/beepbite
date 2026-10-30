import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './add-restaurant.html',
  styleUrl: './add-restaurant.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class AddRestaurantPage {
  constructor() {
    document.title = "Add restaurant · BeepBite admin";
    document.body.className = "l-admin";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./add-restaurant.logic'));
  }
}
