import { Component, ViewEncapsulation, afterNextRender } from '@angular/core';

@Component({
  selector: 'beep-page',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: true,
  host: { class: 'contents' }
})
export class ForgotPasswordPage {
  constructor() {
    document.title = "Forgot password · BeepBite";
    document.body.className = "l-auth";
    document.body.dataset['states'] = "";
    afterNextRender(() => import('./forgot-password.logic'));
  }
}
