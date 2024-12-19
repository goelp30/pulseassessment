import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Option, Question } from '../../../models/question';
import { AssessmentList } from '../../../models/newassessment';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(
    private firebaseService: FireBaseService<Question | Option | AssessmentList>
  ) {}

  getAssessmentById(assessmentId: string): Observable<AssessmentList | null> {
    return this.firebaseService.getAllData('assessmentList').pipe(
      map((assessments: AssessmentList[]) =>
        assessments.find((a) => a.assessmentId === assessmentId) || null
      ),
      catchError((error) => {
        console.error('Error fetching assessments:', error);
        return of(null);
      })
    );
  }

  getQuestionsBySubjects(subjectIds: string[]): Observable<Question[]> {
    return this.firebaseService
      .getAllDataByFilter('questions', 'isQuesDisabled', false)
      .pipe(
        map((questions: Question[]) =>
          questions.filter((q) => subjectIds.includes(q.subjectId))
        ),
        catchError((error) => {
          console.error('Error fetching questions:', error);
          return of([]);
        })
      ); 
  }

  getOptionsForQuestions(questionIds: string[]): Observable<{ [key: string]: Option[] }> {
    return this.firebaseService.getAllData('options').pipe(
      map((options: Option[]) => {
        const optionsMap: { [key: string]: Option[] } = {};
        options.forEach((option) => {
          if (questionIds.includes(option.questionId)) {
            if (!optionsMap[option.questionId]) {
              optionsMap[option.questionId] = [];
            }
            optionsMap[option.questionId].push(option);
          }
        });
        return optionsMap;
      }),
      catchError((error) => {
        console.error('Error fetching options:', error);
        return of({});
      })
    );
  }

  filterQuestionsByDifficulty(
    questions: Question[],
    assessment: AssessmentList
  ): Question[] {
    const subjectIds = Object.keys(assessment.subjects);
    let filteredQuestions: Question[] = [];

    subjectIds.forEach((subjectId) => {
      const subject = assessment.subjects[subjectId];
      const subjectQuestions = questions.filter((q) => q.subjectId === subjectId);

      const easyQuestions = subjectQuestions.filter(
        (q) => q.questionLevel === 'Easy' && q.questionType !== 'Descriptive'
      );
      const mediumQuestions = subjectQuestions.filter(
        (q) => q.questionLevel === 'Medium' && q.questionType !== 'Descriptive'
      );
      const hardQuestions = subjectQuestions.filter(
        (q) => q.questionLevel === 'Hard' && q.questionType !== 'Descriptive'
      );
      const descriptiveQuestions = subjectQuestions.filter(
        (q) => q.questionType === 'Descriptive'
      );

      filteredQuestions = [
        ...filteredQuestions,
        ...this.getRandomQuestions(easyQuestions, subject.easy),
        ...this.getRandomQuestions(mediumQuestions, subject.medium),
        ...this.getRandomQuestions(hardQuestions, subject.hard),
        ...this.getRandomQuestions(descriptiveQuestions, subject.descriptive),
      ];
    });

    return filteredQuestions;
  }

  private getRandomQuestions(questions: Question[], count: number): Question[] {
    if (!questions || questions.length === 0) return [];
    const shuffled = this.shuffleArray(questions);
    return shuffled.slice(0, count);
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
