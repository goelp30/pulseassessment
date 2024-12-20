import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluationService } from '../service/evaluation.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { mergeMap, map } from 'rxjs/operators';
import { QuizAnswers } from '../../../models/quizAnswers';
import { ButtonComponent } from "../../common/button/button.component";
import { QuestionDisplayComponent } from "../question-display/question-display.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluate-assessment',
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css'],
  imports: [QuestionDisplayComponent, CommonModule, ButtonComponent, FormsModule],
  standalone: true,
})
export class EvaluateAssessmentComponent implements OnInit {
  clickedData: any = {}; 
  successMessage: boolean = false; 
  evaluationList: any[] = []; 
  attemptedQuestions: any[] = []; // For attempted questions
  notAttemptedQuestions: any[] = []; // For not attempted questions
  quizId: string = ''; 

  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>
  ) {}

  ngOnInit(): void {
    // Listen for clicked data updates
    this.evaluationService.clickedData$.subscribe((data) => {
      this.clickedData = data; 
      if (this.clickedData) {
               this.quizId = this.clickedData.quizId;
               // Fetch evaluation data when quizId is available
            this.getEvaluationDataByQuizId(this.clickedData.quizId);
             }
       });
       
}
 getEvaluationDataByQuizId(quizId: string): void {
    // Fetch evaluation data from Firebase based on the quizId
    this.firebaseservice
      .getItemsByQuizId('QuizAnswer', quizId)
      .pipe(
        mergeMap((evaluationData: any[]) => {
          const questionIds = evaluationData.map((item) => item.questionId);
          return this.firebaseservice.getQuestionsFromIds('questions', questionIds).pipe(
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
                    const question = questionData.find((q) => q.questionId === item.questionId);
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
          console.log('Combined evaluation list:', combinedData);
          this.evaluationList = combinedData;
          this.evaluateAutoScoredQuestions();
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
        }
      );
  }
  checkDescriptiveMarksEntered(): boolean {
    // Log the attempted questions and their marks for debugging
   
  
    return this.attemptedQuestions.every((question) => {
      if (question.questionType === 'Descriptive') {
      // Ensure marks are entered, including zero (not undefined or null)
        return question.assigned_marks !== undefined && question.assigned_marks !== null;
      }
      return true; // Skip non-descriptive questions
    });
  }
  
  
  categorizeQuestions(combinedData: any[]): void {
    // Separate attempted and not attempted questions
    this.attemptedQuestions = combinedData.filter((question) => this.isQuestionAttempted(question));
    this.notAttemptedQuestions = combinedData.filter((question) => !this.isQuestionAttempted(question));
  }

  isQuestionAttempted(question: any): boolean {
     if (question.questionType === 'Multi'||question.questionType === 'Single') {
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
        const selectedOption = question.options.find((option: { optionId: any }) => option.optionId ==question.userAnswer);
        question.marks = selectedOption?.isCorrectOption ? question.questionWeitage : 0;
      } else if (question.questionType === 'Multi') {
        const correctOptions = question.options
          .filter((option: { isCorrectOption: any }) => option.isCorrectOption)
          .map((option: { optionId: any }) => option.optionId);
        
        let selectedAnswers = question.userAnswer;
        if (typeof selectedAnswers === 'string') selectedAnswers = [selectedAnswers];
        
        let correctCount = 0;
        selectedAnswers.forEach((answer: any) => {
          if (correctOptions.includes(answer)) correctCount++;
        });

        const marksPerCorrectAnswer = question.questionWeitage / correctOptions.length;
        question.marks = correctCount * marksPerCorrectAnswer;

        // Apply penalty for extra answers
        const extraAnswersSelected = selectedAnswers.length - correctOptions.length;
        if (extraAnswersSelected > 0) {
          const penaltyPerExtraAnswer = question.questionWeitage / correctOptions.length;
          question.marks -= extraAnswersSelected * penaltyPerExtraAnswer;
          if (question.marks < 0) question.marks = 0;
        }
      }
    });
  }

  getUserTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      const questionMarks = question.questionType === 'Descriptive' 
        ? (question.assignedMarks || 0) 
        : (question.marks || 0); 
  
      return totalMarks + questionMarks;
    }, 0);
  }

  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeitage || 0);
    }, 0);
  }

  onMarksChange(question: any): void {
    if (question.assigned_marks > question.questionWeitage) {
      question.assigned_marks = question.questionWeitage; // Reset to max allowed marks
    }

    if (question.questionType === 'Descriptive') {
      question.marks = question.assigned_marks; // Assign marks for descriptive questions
    }

    this.getUserTotalMarks();
  }

  onSubmit(): void {
    // Check if all descriptive questions have marks assigned
    if (!this.checkDescriptiveMarksEntered()) {
      alert('Please enter marks for all descriptive questions.');
      return; // Prevent further execution if not all descriptive questions have marks
    }
  
    // Proceed with submission if all checks are passed
    if (!this.evaluationList || this.evaluationList.length === 0) {
      console.error('No evaluation questions available');
      return;
    }
  
    // Check if the assessment is already evaluated (if applicable)
    if (this.clickedData?.isEvaluation) {
      this.router.navigate(['/view']);
      return;
    }
  
    // Set marks for descriptive questions if not already done
    this.evaluationList.forEach((question: any) => {
      if (question.questionType === 'Descriptive') {
        question.marks = question.assigned_marks; // Assign the assigned marks to question
      }
    });
  
    // Calculate the total marks after setting the descriptive question marks
    this.getUserTotalMarks();
    this.successMessage = true;
  
    // Prepare updates for Firebase (or your backend system)
    const updates: { [path: string]: any } = {};
    const assessmentPath = `AssessmentData/${this.quizId}`;
    updates[assessmentPath] = {
      isEvaluated: true,
      result: this.clickedData.result,
    };
  
    // Loop through the evaluation list to update the quiz answers
    this.evaluationList.forEach((question: any) => {
      const quizAnswerPath = `QuizAnswer/${this.quizId}/${question.questionId}`;
      const marksToUpdate = Number(question.marks) || 0;
  
      updates[quizAnswerPath] = {
        marks: marksToUpdate.toString(),
        userAnswer: question.userAnswer || [],
        isDescriptive: question.questionType === 'Descriptive',
      };
    });
  
    // Update Firebase data
    this.firebaseservice.batchUpdate(updates)
      .then(() => {
        console.log('Assessment and Quiz Answers updated successfully');
        alert('Assessment evaluated and results saved successfully.');
        this.router.navigate(['/view']);
      })
      .catch((error) => {
        console.error('Error updating data in Firebase:', error);
        alert('There was an error updating the assessment data. Please try again.');
      });
  }
  
}  