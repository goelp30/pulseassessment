import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluationService } from '../service/evaluation.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { mergeMap, map } from 'rxjs/operators';
import { QuizAnswers } from '../../../models/quizAnswers';
import { ButtonComponent } from '../../common/button/button.component';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationHeaderComponent } from '../evaluation-header/evaluation-header.component';
import { ToastrService } from 'ngx-toastr';
import { PageLabelService } from '../../../../sharedServices/pagelabel.service';
@Component({
  selector: 'app-evaluate-assessment',
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css'],
  imports: [
    QuestionDisplayComponent,
    CommonModule,
    ButtonComponent,
    FormsModule,
    EvaluationHeaderComponent,
  ],
  standalone: true,
})
export class EvaluateAssessmentComponent implements OnInit {
  clickedData: any = {};
  successMessage: boolean = false;
  evaluationList: any[] = [];
  attemptedQuestions: any[] = [];
  notAttemptedQuestions: any[] = [];
  quizId: string = '';
  evaluationComplete: boolean | undefined;
  isLoading: boolean = false;
  isEnteredMarksMoreThanQuestionWeightage: boolean = false;
  constructor(
    private evaluationService: EvaluationService,
    private toastr: ToastrService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>,
    private pageLabelService: PageLabelService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.pageLabelService.updatePageLabel('Evaluate Assessment');

    this.evaluationService.clickedData$.subscribe((data) => {
      this.clickedData = data;
      if (this.clickedData) {
        this.quizId = this.clickedData.quizId;
        this.getEvaluationDataByQuizId(this.clickedData.quizId);
      }
    });
  }

  getEvaluationDataByQuizId(quizId: string): void {
    this.isLoading = true;
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
                        questionWeightage : question?.questionWeightage,
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
          this.evaluateAutoScoredQuestions();
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
          this.isLoading = false;
        }
      );
  }

  checkDescriptiveMarksEntered(): boolean {
    let allMarksValid = true;

    this.attemptedQuestions.forEach((question) => {
      if (question.questionType === 'Descriptive') {
        const marks = question.assigned_marks;
        const weightage = question.questionWeightage;

        if (marks === undefined || marks === null || marks > weightage) {
          allMarksValid = false;
        }
      }
    });

    return allMarksValid;
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

  evaluateAutoScoredQuestions(): void {
    this.evaluationList.forEach((question: any) => {
      if (question.questionType === 'Single') {
        const selectedOption = question.options.find(
          (option: { optionId: any }) => option.optionId == question.userAnswer
        );
        question.marks = selectedOption?.isCorrectOption
          ? question.questionWeightage
          : 0;
      } else if (question.questionType === 'Multi') {
        const correctOptions = question.options
          .filter((option: { isCorrectOption: any }) => option.isCorrectOption)
          .map((option: { optionId: any }) => option.optionId);
          let selectedAnswers = question.userAnswer;
        if (typeof selectedAnswers === 'string') {
          selectedAnswers = [selectedAnswers];  // Convert to array if it's a single string
        }
      // Case 1: Check if the user selected all options
        if (selectedAnswers.length === question.options.length) {
          // Check if any of the selected answers are incorrect
          const incorrectAnswers = selectedAnswers.filter(
            (answer: any) => !correctOptions.includes(answer)
          );
    
          // If there are any incorrect answers, assign 0 marks
          if (incorrectAnswers.length > 0) {
            question.marks = 0;
          } else {
            // If all selected answers are correct, assign full marks
            question.marks = question.questionWeightage;
          }
        } else {
          // Case 2: Apply the existing logic if not all options are selected
          let correctCount = 0;
          selectedAnswers.forEach((answer: any) => {
            if (correctOptions.includes(answer)) correctCount++;
          });
    
          const marksPerCorrectAnswer = question.questionWeightage / correctOptions.length;
          question.marks = correctCount * marksPerCorrectAnswer;
    
          const extraAnswersSelected = selectedAnswers.length - correctOptions.length;
          if (extraAnswersSelected > 0) {
            const penaltyPerExtraAnswer = question.questionWeightage / correctOptions.length;
            question.marks -= extraAnswersSelected * penaltyPerExtraAnswer;
            if (question.marks < 0) question.marks = 0;
          }
        }
    }
  });
  }

  getUserTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      const questionMarks =
        question.questionType === 'Descriptive'
          ? question.assignedMarks || 0
          : question.marks || 0;
      return totalMarks + questionMarks;
    }, 0);
  }

  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeightage || 0);
    }, 0);
  }

  onMarksChange(question: any): void {
    const marks = parseInt(question.assigned_marks || '0', 10);
    const weightage = parseInt(question.questionWeightage || '0', 10);

    // Ensure marks are within valid range
    if (marks > weightage) {
      question.assigned_marks = weightage; 
    }

    // Update button state
    this.successMessage = this.checkDescriptiveMarksEntered();

    this.getUserTotalMarks();
  }

  onBackClick() {
    sessionStorage.removeItem('clickedData');
    this.router.navigate(['/evaluation']);
  }

  onSubmit(): void {
    if (!this.checkDescriptiveMarksEntered()) {
      return;
    }

    if (!this.evaluationList || this.evaluationList.length === 0) {
      console.error('No evaluation questions available');
      return;
    }

    if (this.clickedData?.isEvaluation) {
      this.router.navigate(['/view']);
      return;
    }

    // Set marks for descriptive questions if not already done
    this.evaluationList.forEach((question: any) => {
      if (question.questionType === 'Descriptive') {
        question.marks = question.assigned_marks;
      }
    });

    this.getUserTotalMarks();
    this.successMessage = true;

    const updates: { [path: string]: any } = {};
    const assessmentPath = `AssessmentData/${this.quizId}`;
    updates[assessmentPath] = {
      isEvaluated: true,
      result: this.clickedData.result,
    };

    this.evaluationList.forEach((question: any) => {
      const quizAnswerPath = `QuizAnswer/${this.quizId}/${question.questionId}`;
      const marksToUpdate = Number(question.marks) || 0;
      updates[quizAnswerPath] = {
        marks: marksToUpdate.toString(),
        userAnswer: question.userAnswer || [],
        isDescriptive: question.questionType === 'Descriptive',
      };
    });

    this.firebaseservice
      .batchUpdate(updates)
      .then(() => {
        this.toastr.success(
          'Assessment evaluated and results saved successfully.',
          'Success'
        );
        this.evaluationComplete = true;
        sessionStorage.removeItem('clickedData');
        this.router.navigate(['/view']);
      })
      .catch((error) => {
        console.error('Error updating data in Firebase:', error);
        this.toastr.error(
          'There was an error updating the assessment data. Please try again.',
          'Error'
        );
      });
  }
}
