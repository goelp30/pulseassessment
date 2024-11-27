import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [NgClass],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css'
})
export class QuestionsComponent {
  
    "questions" =  [
      {
        "questionNo": 1,
        "question": "What is Angular primarily used for?",
        "options": [
          {  "option" : 'A', "text": "Frontend development" },
          { "text": "Database management" },
          { "text": "Operating system design" },
          { "text": "Game development" }
        ],
        "correctAnswer": "A"
      },
      {
        "questionNo": 2,
        "question": "Which language is primarily used in Angular?",
        "options": [
          { "option": "A", "text": "Java" },
          { "option": "B", "text": "TypeScript" },
          { "option": "C", "text": "Python" },
          { "option": "D", "text": "PHP" }
        ],
        "correctAnswer": "B"
      },
      {
        "questionNo": 3,
        "question": "What does Angular use for template syntax?",
        "options": [
          { "option": "A", "text": "Handlebars" },
          { "option": "B", "text": "Interpolation" },
          { "option": "C", "text": "JSX" },
          { "option": "D", "text": "Pug" }
        ],
        "correctAnswer": "B"
      },
      {
        "questionNo": 4,
        "question": "Which architecture does Angular follow?",
        "options": [
          { "option": "A", "text": "MVC" },
          { "option": "B", "text": "MVVM" },
          { "option": "C", "text": "MVP" },
          { "option": "D", "text": "Flux" }
        ],
        "correctAnswer": "B"
      },
      {
        "questionNo": 5,
        "question": "What is the purpose of Angular CLI?",
        "options": [
          { "option": "A", "text": "Generate new projects and components" },
          { "option": "B", "text": "Optimize database queries" },
          { "option": "C", "text": "Handle server-side rendering" },
          { "option": "D", "text": "Debug Node.js applications" }
        ],
        "correctAnswer": "A"
      }
    ]

    type = "radio"


}


