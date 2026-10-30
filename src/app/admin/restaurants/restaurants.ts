import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class RestaurantsPage {
  constructor() {
    document.title = "Restaurants · BeepBite admin";
    document.body.className = "l-admin";
    document.body.dataset['states'] = "default:All restaurants,loading:Loading";
    afterNextRender(() => import('./restaurants.logic'));
  }
}
