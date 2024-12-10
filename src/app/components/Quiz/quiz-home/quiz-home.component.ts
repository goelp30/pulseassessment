import { Component } from '@angular/core';
import { QuizComponent } from '../quiz-components/quiz/quiz.component';

@Component({
  selector: 'app-quiz-home',
  standalone: true,
  imports: [QuizComponent],
  templateUrl: './quiz-home.component.html',
  styleUrl: './quiz-home.component.css'
})
export class QuizHomeComponent {

}
