import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class ProfilePage {
  constructor() {
    document.title = "Profile · BeepBite";
    document.body.className = "l-customer";
    document.body.dataset['states'] = "default:Default,loading:Loading";
    afterNextRender(() => import('./profile.logic'));
  }
}
