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

    if (isDescriptive) {
      // For descriptive questions
      const quizAnswer: QuizAnswer = {
        questionId: questionId,
        quizId: this.quizId,
        isDescriptive: true,
        marks: '0',
        userAnswer: [],
        answer: descriptiveAnswer,
        questionType: 'Descriptive',
        isEvaluated: false,
        evaluatedAt: ''
      };
      this.userAnswers[this.quizId][questionId] = quizAnswer;
    } else {
      // For MCQ/Single choice questions
      const existingAnswer = this.userAnswers[this.quizId][questionId];
      
      // Combine existing answers with new ones for multiple choice
      let combinedAnswers = userAnswer;
      if (existingAnswer?.userAnswer && existingAnswer.userAnswer.length > 0) {
        combinedAnswers = [...new Set([...existingAnswer.userAnswer, ...userAnswer])];
      }
      
      const quizAnswer: QuizAnswer = {
        questionId: questionId,
        quizId: this.quizId,
        isDescriptive: false,
        marks: marks,
        userAnswer: combinedAnswers,
        answer: '',
        questionType: 'Multi',
        isEvaluated: true,
        evaluatedAt: new Date().toISOString()
      };
      this.userAnswers[this.quizId][questionId] = quizAnswer;
    }

    console.log('Stored Answer:', {
      questionId,
      isDescriptive,
      marks,
      userAnswer: this.userAnswers[this.quizId][questionId].userAnswer,
      descriptiveAnswer: this.userAnswers[this.quizId][questionId].answer
    });
  }

  getUserAnswers() {
    return this.userAnswers[this.quizId] || {};
  }

  submitQuiz(questions: Question[], totalMarks: number) {
    const hasDescriptiveQuestions = questions.some(q => q.questionType === 'Descriptive');
    
    const assessmentData: AssessmentData = {
      assessmentID: this.assessmentID,
      quizId: this.quizId,
      isEvaluated: !hasDescriptiveQuestions,
      userId: this.userId,
      result: totalMarks.toString(),
      submittedAt: new Date().toISOString(),
      totalMarks: totalMarks.toString(),
      maxMarks: questions.reduce((sum, q) => sum + (q.questionWeightage || 0), 0).toString()
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