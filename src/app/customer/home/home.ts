import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './home.html',
  styleUrl: './home.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class HomePage {
  constructor() {
    document.title = "My code · BeepBite";
    document.body.className = "l-customer";
    document.body.dataset['states'] = "default:Live orders,enlarged:QR enlarged,loading:Loading";
    afterNextRender(() => import('./home.logic'));
  }
}
