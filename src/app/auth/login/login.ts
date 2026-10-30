import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class LoginPage {
  constructor() {
    document.title = "Sign in · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "default:Default,registered:Just registered,reset:Password updated";
    afterNextRender(() => import('./login.logic'));
  }
}
