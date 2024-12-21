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
    marks: string, 
    descriptiveAnswer: string = ''
  ) {
    if (!this.userAnswers[this.quizId]) {
      this.userAnswers[this.quizId] = {};
    }

    const quizAnswer: QuizAnswer = {
      questionId: questionId,
      quizId: this.quizId,
      isDescriptive: isDescriptive,
      marks: marks,
      userAnswer: isDescriptive ? [] : userAnswer,
      answer: isDescriptive ? descriptiveAnswer : ''
    };

    this.userAnswers[this.quizId][questionId] = quizAnswer;
    
    console.log('Stored Answer:', {
      questionId,
      isDescriptive,
      marks,
      userAnswer: quizAnswer.userAnswer,
      descriptiveAnswer: quizAnswer.answer
    });
  }
  
  getUserAnswers() {
    return this.userAnswers[this.quizId] || {};
  }

  submitQuiz(questions: Question[], totalMarks: number) {
    const assessmentData: AssessmentData = {
      assessmentID: this.assessmentID,
      quizId: this.quizId,
      isEvaluated: questions.some(q => q.questionType && q.questionType.toLowerCase() === 'descriptive') ? false : true,  
      userId: this.userId,
      result: totalMarks.toString(),
      submittedAt: new Date().toISOString(),
      totalMarks: totalMarks.toString(),
      maxMarks: questions.reduce((sum, q) => sum + (q.questionWeightage || 0), 0).toString()
    };

    // First save assessment data
    this.fireBaseService.create(`/AssessmentData/${this.quizId}`, assessmentData)
      .then(() => {
        console.log('Assessment Data saved successfully:', assessmentData);
        
        // Then save all quiz answers
        const quizAnswers = this.getUserAnswers();
        const batchUpdate: { [key: string]: QuizAnswer } = {};

        Object.keys(quizAnswers).forEach(questionId => {
          const answer = quizAnswers[questionId];
          const question = questions.find(q => q.questionId === questionId);
          
          batchUpdate[`/QuizAnswer/${this.quizId}/${questionId}`] = {
            questionId: answer.questionId,
            isDescriptive: answer.isDescriptive,
            marks: answer.marks,
            maxMarks: question?.questionWeightage?.toString() || '0',
            userAnswer: answer.userAnswer || [],
            answer: answer.answer || '',
            quizId: this.quizId,
            questionType: question?.questionType || '',
            isEvaluated: !answer.isDescriptive,
            evaluatedAt: new Date().toISOString()
          };
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