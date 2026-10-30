import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './account.html',
  styleUrl: './account.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class AccountPage {
  constructor() {
    document.title = "Account · BeepBite";
    document.body.className = "l-restaurant";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./account.logic'));
  }
}
