import { Component } from '@angular/core';
import { FireBaseService } from '../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-assessment-response',
  standalone: true,
  imports: [],
  templateUrl: './assessment-response.component.html',
  styleUrl: './assessment-response.component.css'
})
export class AssessmentResponseComponent {
constructor(private firebaseService:FireBaseService<any>){}
  addQuestionsForAssessment(subjectName: string): any {
    return {
      easy: {
        ques1: {
          type: 'single',
          text: `What is Angular primarily used for?`,
          options: [
            'Server-side scripting',
            'Mobile App Development',
            'Web Application Development',
            'Database Management',
          ],
          max_marks: 1,
          correct: 'Web Application Development',
          users_answer: [],
        },
      },
    };
  }

  createQuestions(subjectId: string, subjectName: string): void {
    const quizData = this.addQuestionsForAssessment(subjectName);
    this.firebaseService
      .create(`assessmentResponse/`, quizData)
      .then(() => {
        console.log('Quiz data added successfully!');
      })
      .catch((error) => {
        console.error('Error adding quiz data:', error);
      });
  }
}
