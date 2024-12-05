import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-add-question',
  standalone: true,
  templateUrl: './add-question.component.html',
})
export class AddQuestionComponent implements OnInit {
  subjects: any[] = [];
  subjectName: any;
  subjectId: any;

  constructor(private firebaseService: FireBaseService<any>) {}

  ngOnInit() {
    // this.getSubjects();
  }

  getSubjects(): void {
    this.firebaseService.getAllData('subject').subscribe(
      (data) => {
        this.subjects = data;
        console.log(this.subjects);
        this.subjects.map((sub) => {
          (this.subjectName = sub.subjectName),
            (this.subjectId = sub.subjectId);
          this.createQuestions(sub.subjectId, sub.subjectName);
        });
      },
      (error) => console.error('Error fetching assessments:', error)
    );
  }

  // options: [
  //   { text: 'Server-side scripting', correct: false },
  //   { text: 'Mobile App Development', correct: false },
  //   { text: 'Web Application Development', correct: true },
  //   { text: 'Database Management', correct: false }
  // ]

  // options: ['Server-side scripting', 'Mobile App Development', 'Web Application Development', 'Database Management'],
  // correctAnswers: [2] // Index of correct option(s)

  addQuestionsForAssessment(subjectName: string): any {
    return {
      easy: {
        ques1: {
          type: 'single',
          text: `What is ${subjectName} primarily used for?`,
          options: [
            { text: 'Server-side scripting', correct: false },
            { text: 'Mobile App Development', correct: false },
            { text: 'Web Application Development', correct: true },
            { text: 'Database Management', correct: false },
          ],
          max_marks: 1,
          correct: '',
        },
      },
      medium: {
        ques1: {
          type: 'multi',
          text: `Which of the following are features of ${subjectName}?`,
          options: [
            { text: 'Two-way data binding', correct: true },
            { text: 'Static page generation', correct: false },
            { text: 'Dependency injection', correct: true },
            { text: 'Machine learning models', correct: false },
          ],
          max_marks: 3,
          correct: [],
        },
      },
      hard: {
        ques1: {
          type: 'multi',
          text: `Explain the lifecycle hooks in ${subjectName}.`,
          options: [
            { text: 'ngOnInit()', correct: true },
            { text: 'ngOnDestroy()', correct: true },
            { text: 'ngRender()', correct: false },
            { text: 'ngCompile()', correct: false },
          ],
          max_marks: 5,
          correct: [],
        },
      },
      descriptive: {
        ques1: {
          text: `Describe the advantages of using ${subjectName} in large-scale applications.`,
          max_marks: 10,
        },
      },
    };
  }

  createQuestions(subjectId: string, subjectName: string): void {
    const quizData = this.addQuestionsForAssessment(subjectName);
    this.firebaseService
      .create(`questions/${this.subjectId}`, quizData)
      .then(() => {
        console.log('Quiz data added successfully!');
      })
      .catch((error) => {
        console.error('Error adding quiz data:', error);
      });
  }
}


// function evaluateQuestion(userResponse: string[], options: { text: string; correct: boolean }[]): number {
//   let score = 0;

//   // Check if all user responses are correct
//   options.forEach((option, index) => {
//     if (userResponse.includes(option.text) && option.correct) {
//       score++;
//     }
//   });
//   return score; // Adjust logic for partial/total scoring as needed
// }
