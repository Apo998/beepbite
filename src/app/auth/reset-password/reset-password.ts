import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class ResetPasswordPage {
  constructor() {
    document.title = "New password · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./reset-password.logic'));
  }
}
