import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import './motion';
import { routes } from './app/routes';

@Component({ selector: 'beep-root', imports: [RouterOutlet], template: '<router-outlet />' })
class App {}

bootstrapApplication(App, { providers: [provideZonelessChangeDetection(), provideRouter(routes)] }).catch(console.error);
