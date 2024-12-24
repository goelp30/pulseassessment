import { Injectable } from '@angular/core';
import { Answer, QuizAnswer, QuizAnswers, AssessmentData } from '../../../models/quizAnswers';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Question } from '../../../models/question';

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

  storeAnswer(
    questionId: string, 
    isDescriptive: boolean, 
    userAnswer: string[], 
    marks: string = '0', 
    descriptiveAnswer: string = ''
  ) {
    if (!this.userAnswers[this.quizId]) {
      this.userAnswers[this.quizId] = {};
    }

    // Create new answer object
    const answer: Answer = {
      questionId: questionId,
      isDescriptive: isDescriptive,
      marks: marks,
      userAnswer: userAnswer,
      answer: descriptiveAnswer,
      questionType: isDescriptive ? 'Descriptive' : 'Single',
      isEvaluated: !isDescriptive,
      evaluatedAt: !isDescriptive ? new Date().toISOString() : '',
      quizId: this.quizId // Add quizId for backward compatibility
    };

    // Override the previous answer in memory
    this.userAnswers[this.quizId][questionId] = answer;

    // Store in both new and old format for backward compatibility
    const promises = [
      // New format
      this.fireBaseService.update(`/QuizAnswer/${this.quizId}/${questionId}`, answer),
      // Old format (if needed)
      this.fireBaseService.update(`quizAnswers/${questionId}`, {
        ...answer,
        quizId: this.quizId
      })
    ];

    return Promise.all(promises)
      .then(() => {
        console.log('Answer updated in Firebase:', {
          questionId,
          userAnswer,
          marks
        });
      })
      .catch(error => {
        console.error('Error updating answer in Firebase:', error);
      });
  }

  getUserAnswers() {
    return this.userAnswers[this.quizId] || {};
  }

  submitQuiz(
    questions: Question[], 
    totalMarks: number,
    isAutoEvaluated: boolean = false,
    isPassed: boolean = false
  ) {
    const quizAnswer: QuizAnswer = {
      userId: this.userId,
      assessmentId: this.assessmentID,
      answers: this.userAnswers[this.quizId] || {},
      totalMarks: totalMarks,
      submittedAt: new Date().toISOString(),
      isAutoEvaluated: isAutoEvaluated,
      isPassed: isPassed
    };

    // Store in both formats for backward compatibility
    const promises = [
      // New format
      this.fireBaseService.create('quizAnswers', quizAnswer),
      // Old format assessment data
      this.fireBaseService.create(`AssessmentData/${this.quizId}`, {
        assessmentID: this.assessmentID,
        quizId: this.quizId,
        isEvaluated: isAutoEvaluated,
        userId: this.userId,
        result: isPassed ? 'Pass' : 'Fail',
        submittedAt: new Date().toISOString(),
        totalMarks: totalMarks.toString(),
        maxMarks: questions.reduce((sum, q) => sum + (q.marks || 0), 0).toString(),
        percentage: ((totalMarks / questions.reduce((sum, q) => sum + (q.marks || 0), 0)) * 100).toFixed(2)
      })
    ];

    return Promise.all(promises);
  }
}