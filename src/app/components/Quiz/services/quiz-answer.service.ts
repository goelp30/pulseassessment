import { Injectable } from '@angular/core';
import { QuizAnswer, QuizAnswers } from '../../../models/quizAnswers';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';

@Injectable({
  providedIn: 'root',
})
export class QuizAnswerService {
  private userAnswers: QuizAnswers = {};
  private quizId = crypto.randomUUID();
  private userId: string = '';  
  private assessmentID: string = ''; 

  constructor(private fireBaseService: FireBaseService<any>) {}

  setUserId(userId: string) {
    this.userId = userId;
  }
  setAssessmentId(assessmentID: string) {
    this.assessmentID = assessmentID;
  }

  storeAnswer(questionId: string, isDescriptive: boolean, answer: string | string[]) {
    console.log('Received answer:', answer);
    console.log('Is Descriptive:', isDescriptive);
    // Define the base quizAnswer object
    const quizAnswer: QuizAnswer = {
      isDescriptive: isDescriptive,
      questionId: questionId,
      quizId: this.quizId,
      marks: '', 
    };
  
    if (isDescriptive) {
      // Ensure descriptive answer is stored as a string
      quizAnswer.answer = String(answer);
      console.log('Descriptive answer:', String(answer));
    } else {
      // Handle non-descriptive answer
      if (Array.isArray(answer)) {
        console.log('Option answers:', answer);
      if (this.userAnswers[this.quizId] && this.userAnswers[this.quizId][questionId]) {
        const existingAnswers = this.userAnswers[this.quizId][questionId].userAnswer || [];
        // Append new selected options to the existing userAnswer array
        quizAnswer.userAnswer = [
          ...new Set([
            ...existingAnswers, 
            ...answer
          ])
        ];
        console.log('Updated userAnswer (after append):', quizAnswer.userAnswer);
      } else {
        // If no previous answers, just store the selected options
        // quizAnswer.userAnswer = [String(answer)];
        quizAnswer.userAnswer = [...answer];
      }

      } else {
        console.log('Single option answer:', String(answer));
        quizAnswer.userAnswer = [String(answer)];
      }
    }
  
    if (!this.userAnswers[this.quizId]) {
      this.userAnswers[this.quizId] = {};
    }
  
    this.userAnswers[this.quizId][questionId] = quizAnswer;
    console.log('Stored userAnswers:', this.userAnswers);
  }
  
  getUserAnswers() {
    return this.userAnswers[this.quizId] || {};
  }

  submitQuiz(questions: any[]) {
    const assessmentData = {
      assessmentID: this.assessmentID,
      quizId: this.quizId,
      isEvaluated: questions.some(q => q.questionType === 'descriptive') ? false : true,  
      userId: this.userId,
      result: '', 
    };

    this.fireBaseService.create(`/AssessmentData/${this.quizId}`, assessmentData).then(() => {
      console.log('Assessment Data saved successfully!');
    }).catch(error => {
      console.error('Error saving assessment data:', error);
    });

    const quizAnswers = this.getUserAnswers();
    const batchUpdate: any = {};

    Object.keys(quizAnswers).forEach(questionId => {
      batchUpdate[`/QuizAnswer/${this.quizId}/${questionId}`] = quizAnswers[questionId];
    });

    this.fireBaseService.batchUpdate(batchUpdate).then(() => {
      console.log('Quiz Answer data saved successfully!');
    }).catch(error => {
      console.error('Error saving quiz answers:', error);
    });
  }
}