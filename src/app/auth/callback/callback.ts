import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './callback.html',
  styleUrl: './callback.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class CallbackPage {
  constructor() {
    document.title = "One moment · BeepBite";
    document.body.className = "l-auth callback";
    document.body.dataset['states'] = "signin:Signed in,signout:Signed out,registered:Account created,expired:Session expired,denied:Wrong account,error:Can't connect";
    afterNextRender(() => import('./callback.logic'));
  }
}
