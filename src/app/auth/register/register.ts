import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './register.html',
  styleUrl: './register.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class RegisterPage {
  constructor() {
    document.title = "Create account · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./register.logic'));
  }
}
