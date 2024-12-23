import { Injectable } from '@angular/core';
import { QuizAnswer, QuizAnswers, AssessmentData } from '../../../models/quizAnswers';
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
    const quizAnswer: QuizAnswer = {
      questionId: questionId,
      quizId: this.quizId,
      isDescriptive: isDescriptive,
      marks: marks,
      userAnswer: userAnswer, // This will override previous answers
      answer: descriptiveAnswer,
      questionType: isDescriptive ? 'Descriptive' : 'Single',
      isEvaluated: !isDescriptive,
      evaluatedAt: !isDescriptive ? new Date().toISOString() : ''
    };

    // Override the previous answer in memory
    this.userAnswers[this.quizId][questionId] = quizAnswer;

    // Immediately update in Firebase
    this.fireBaseService.update(`/QuizAnswer/${this.quizId}/${questionId}`, quizAnswer)
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

  submitQuiz(questions: Question[], totalMarks: number) {
    const hasDescriptiveQuestions = questions.some(q => q.questionType === 'Descriptive');
    const maxMarks = questions.reduce((sum, q) => sum + (q.questionWeightage || 0), 0).toString();
    const percentage = (totalMarks / parseInt(maxMarks)) * 100;
    const result = percentage >= 70 ? 'Pass' : 'Fail';
    
    const assessmentData: AssessmentData = {
      assessmentID: this.assessmentID,
      quizId: this.quizId,
      isEvaluated: !hasDescriptiveQuestions,
      userId: this.userId,
      result: hasDescriptiveQuestions ? 'Pending' : result,
      submittedAt: new Date().toISOString(),
      totalMarks: totalMarks.toString(),
      maxMarks: maxMarks,
      percentage: percentage.toFixed(2)
    };

    this.fireBaseService.create(`/AssessmentData/${this.quizId}`, assessmentData)
      .then(() => {
        console.log('Assessment Data saved successfully:', assessmentData);
        
        const quizAnswers = this.getUserAnswers();
        const batchUpdate: { [key: string]: QuizAnswer } = {};

        Object.keys(quizAnswers).forEach(questionId => {
          const answer = quizAnswers[questionId];
          const question = questions.find(q => q.questionId === questionId);
          
          if (question?.questionType === 'Descriptive') {
            batchUpdate[`/QuizAnswer/${this.quizId}/${questionId}`] = {
              questionId: answer.questionId,
              quizId: this.quizId,
              isDescriptive: true,
              marks: '0',
              userAnswer: [],
              answer: answer.answer || '',
              maxMarks: question.questionWeightage?.toString() || '0',
              questionType: 'Descriptive',
              isEvaluated: false,
              evaluatedAt: ''
            };
          } else {
            batchUpdate[`/QuizAnswer/${this.quizId}/${questionId}`] = {
              questionId: answer.questionId,
              quizId: this.quizId,
              isDescriptive: false,
              marks: answer.marks,
              userAnswer: answer.userAnswer || [],
              answer: '',
              maxMarks: question?.questionWeightage?.toString() || '0',
              questionType: question?.questionType || '',
              isEvaluated: true,
              evaluatedAt: new Date().toISOString()
            };
          }
        });

        console.log('Saving quiz answers to Firebase:', batchUpdate);
        return this.fireBaseService.batchUpdate(batchUpdate);
      })
      .then(() => {
        console.log('Quiz Answer data saved successfully with marks!');
      })
      .catch(error => {
        console.error('Error saving quiz data:', error);
      });
  }
}