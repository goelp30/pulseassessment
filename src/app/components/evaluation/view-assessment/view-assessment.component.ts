import { Component, OnInit } from '@angular/core';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { mergeMap, map } from 'rxjs/operators';
import { QuizAnswers } from '../../../models/quizAnswers';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './view-assessment.component.html',
  styleUrls: ['./view-assessment.component.css'],
})
export class ViewAssessmentComponent implements OnInit {
  clickedData: any = {}; // To store the clicked data for the assessment
  quizId: string = ''; // Initialize quizId
  evaluationList: any[] = []; // Initialize an empty evaluation list

  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>
  ) {}

  ngOnInit(): void {
    // Get clicked data from the service
    this.clickedData = this.evaluationService.getData();
    console.log('Clicked Data:', this.clickedData);

    // Get the quizId from the service (assuming it's available)
    this.quizId = this.clickedData.quizId;

    // Fetch the data based on the quizId
    if (this.quizId) {
      this.getEvaluationDataByQuizId(this.quizId);
    }
  }

  getEvaluationDataByQuizId(quizId: string): void {
    // Fetch evaluation data from Firebase based on the quizId
    this.firebaseservice
      .getItemsByQuizId('QuizAnswer', quizId)
      .pipe(
        mergeMap((evaluationData: any[]) => {
          const questionIds = evaluationData.map((item) => item.questionId);
          return this.firebaseservice
            .getQuestionsFromIds('EvaluationQuestionData', questionIds)
            .pipe(
              mergeMap((questionData: any[]) => {
                return this.firebaseservice.getAllOptions('EvaluationOptionData').pipe(
                  map((optionData: any[]) => {
                    const optionsMap = optionData.reduce((acc, option) => {
                      if (!acc[option.questionId]) {
                        acc[option.questionId] = [];
                      }
                      acc[option.questionId].push(option);
                      return acc;
                    }, {} as { [key: string]: any[] });

                    const combinedData = evaluationData.map((item) => {
                      const question = questionData.find(
                        (q) => q.questionId === item.questionId
                      );
                      const options = optionsMap[item.questionId] || [];
                      return {
                        ...item,
                        questionText: question?.questionText,
                        questionWeitage: question?.questionWeitage,
                        questionType: question?.questionType,
                        options: options,
                      };
                    });

                    // Store the combined data in the evaluationList
                    this.evaluationList = combinedData;
                    return combinedData;
                  })
                );
              })
            );
        })
      )
      .subscribe(
        (combinedData: any[]) => {
          console.log('Combined evaluation list:', this.evaluationList);
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
        }
      );
  }

  // Calculate the total marks scored by the user
  getUserMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      // Convert marks to a number before adding
      const marks = Number(question.marks) || 0;  // Fallback to 0 if the marks are not a valid number
      return totalMarks + marks;
    }, 0);
  }
// Calculate the total possible marks
  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeitage || 0);
    }, 0);
  }

  // Navigate to another page (evaluation dashboard)
  onSubmit(): void {
    this.router.navigate(['/evaluation']);
  }
}
