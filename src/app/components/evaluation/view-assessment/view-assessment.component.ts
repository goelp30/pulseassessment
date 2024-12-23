import { Component, OnInit, OnDestroy } from '@angular/core';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { mergeMap, map, takeUntil } from 'rxjs/operators';
import { QuizAnswers } from '../../../models/quizAnswers';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { EvaluationHeaderComponent } from '../evaluation-header/evaluation-header.component';
import { Subject } from 'rxjs';
import { PageLabelService } from '../../../../sharedServices/pagelabel.service';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [CommonModule, QuestionDisplayComponent, EvaluationHeaderComponent],
  templateUrl: './view-assessment.component.html',
  styleUrls: ['./view-assessment.component.css'],
})
export class ViewAssessmentComponent implements OnInit, OnDestroy {
  clickedData: any = {};
  evaluationList: any[] = [];
  attemptedQuestions: any[] = []; 
  notAttemptedQuestions: any[] = []; 
  quizId: string = '';
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>,
    private pageLabelService: PageLabelService  
  ) {}

  ngOnInit(): void {
    // Listen for clicked data updates
    this.isLoading = true;
    this.pageLabelService.updatePageLabel('View Assessment');
    this.evaluationService.clickedData$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      this.clickedData = data;
      if (this.clickedData && this.clickedData.quizId) {
        this.quizId = this.clickedData.quizId;
        // Fetch evaluation data when quizId is available
        this.getEvaluationDataByQuizId(this.clickedData.quizId);
      }else{
        this.evaluationList = [];
         this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEvaluationDataByQuizId(quizId: string): void {
    this.isLoading = true;
    // Fetch evaluation data from Firebase based on the quizId
    this.firebaseservice
      .getItemsByQuizId('QuizAnswer', quizId)
      .pipe(
        mergeMap((evaluationData: any[]) => {
          const questionIds = evaluationData.map((item) => item.questionId);
          return this.firebaseservice
            .getQuestionsFromIds('questions', questionIds)
            .pipe(
              mergeMap((questionData: any[]) => {
                return this.firebaseservice.getAllOptions('options').pipe(
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
                        questionWeitage: question?.questionWeightage,
                        questionType: question?.questionType,
                        options: options,
                      };
                    });

                    this.categorizeQuestions(combinedData);
                    return combinedData;
                  })
                );
              })
            );
        })
      )
      .subscribe(
        (combinedData: any[]) => {
          this.evaluationList = combinedData;
           this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
          this.isLoading = false;
        }
      );
  }
  
  categorizeQuestions(combinedData: any[]): void {
    // Separate attempted and not attempted questions
    this.attemptedQuestions = combinedData.filter((question) =>
      this.isQuestionAttempted(question)
    );
    this.notAttemptedQuestions = combinedData.filter(
      (question) => !this.isQuestionAttempted(question)
    );
  }

  isQuestionAttempted(question: any): boolean {
    // Check if the question is attempted
    if (
      question.questionType === 'Multi' ||
      question.questionType === 'Single'
    ) {
      return question.userAnswer && question.userAnswer.length > 0;
    }

    if (question.questionType === 'Descriptive') {
      return question.answer && question.answer.trim() !== '';
    }

    return false;
  }

  // Calculate the total marks scored by the user
  getUserMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      const marks = Number(question.marks) || 0; 
      return totalMarks + marks;
    }, 0);
  }

  // Calculate the total possible marks
  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeitage || 0);
    }, 0);
  }

  onSubmit(): void {
    sessionStorage.removeItem('clickedData');  
    this.router.navigate(['/evaluation']);
  }
}