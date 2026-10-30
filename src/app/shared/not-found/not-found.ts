import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class NotFoundPage {
  constructor() {
    document.title = "Page not found · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "visitor:Visitor,customer:Signed in \u00b7 customer,restaurant:Signed in \u00b7 restaurant,admin:Signed in \u00b7 admin";
    afterNextRender(() => import('./not-found.logic'));
  }
}
