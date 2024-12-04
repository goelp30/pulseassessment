import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { QuizPage } from './app/pages/quiz.page';
import { NotificationComponent } from './app/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [QuizPage, NotificationComponent],
  template: `
    <app-notification />
    <app-quiz />
  `
})
export class App {}

bootstrapApplication(App);