import { Injectable, Type } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { catchError, map, Observable, take } from 'rxjs';
import { Options, Question } from '../app/models/question.model';
import { AssessmentList } from '../app/models/newassessment';

@Injectable({
  providedIn: 'root',
})
export class FireBaseService<T> {
  getData(arg0: string) {
    throw new Error('Method not implemented.');
  }

  documentToDomainObject = (_: any) => {
    const object = _.payload.val();
    return object;
  };

  constructor(private database: AngularFireDatabase) {}

  /***
   * create new element in table
   */
  create<T>(tableName: string, params: T): Promise<void> {
    return this.database.object(tableName).set(params);
  }

  /***
   * Update new
   */
  update(tableName: string, params: Partial<T>) {
    return this.database.object(tableName).update(params);
  }

  /***
   * listens changes
   */
  listensToChange(tableName: string): Observable<T[]> {
    return this.database.list(tableName).valueChanges() as Observable<T[]>;
  }

  /**
   * To Add Data
   */
  addData(tableName: string, id: string, params: T): Promise<void> {
    return this.database.object(`${tableName}/${id}`).set(params);
  }

  /***
   * Once get all
   */
  getAllData(tableName: string) {
    return this.database
      .list(tableName)
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  /***
   * listens changes with filter
   */
  listensToChangeWithFilter(
    tableName: string,
    searchField: string,
    searchValue: string | number | boolean
  ): Observable<T[]> {
    return this.database
      .list(tableName, (res) =>
        res.orderByChild(searchField).equalTo(searchValue)
      )
      .valueChanges() as Observable<T[]>;
  }

  /***
   * Once get all with filter
   */
  getAllDataByFilter(
    tableName: string,
    searchField: string,
    searchValue: string | number | boolean
  ) {
    return this.database
      .list(tableName, (res) =>
        res.orderByChild(searchField).equalTo(searchValue)
      )
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  getItemsByFields(
    path: string,
    fields: string[],
    value: any
  ): Observable<T[]> {
    return this.database
      .list<T>(path)
      .valueChanges()
      .pipe(
        map((items) =>
          items.filter((item) =>
            fields.some((field) => (item as any)[field] === value)
          )
        ),
        catchError((error) => {
          console.error(`Error filtering items in ${path}:`, error);
          throw error;
        })
      );
  }

  //! Methods for quiz app:
  /**
   * Get all subjects for a specific assessment.
   * @param assessmentId The ID of the assessment.
   * @returns An Observable that emits an array of subject IDs.
   */
  getSubjectsByAssessmentId(assessmentId: string): Observable<string[]> {
    return this.database
      .object<AssessmentList>(`assessmentList/${assessmentId}`)
      .valueChanges()
      .pipe(
        take(1), // Only take the first value
        map((assessmentData) => {
          if (assessmentData && assessmentData.subjects) {
            return Object.keys(assessmentData.subjects);
          } else {
            return []; // or throw error if needed;
          }
        })
      );
  }

  /**
   * Get all questions of a specific subject.
   * @param subjectId The ID of the subject.
   * @returns An Observable that emits an array of questions.
   */
  getQuestionsBySubjectId(subjectId: string): Observable<Question[]> {
    return this.database
      .list<Question>('questions', (ref) =>
        ref.orderByChild('subjectId').equalTo(subjectId)
      )
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  /**
   * Get all options for a specific question.
   * @param questionId The ID of the question.
   * @returns An Observable that emits an array of options.
   */
  getOptionsByQuestionId(questionId: string): Observable<any[]> {
    return this.database
      .list<Options>('options', (ref) =>
        ref.orderByChild('questionId').equalTo(questionId)
      )
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }

  //! When the user submit the quiz(onNext() store the records)

  // Service 1: Create Quiz Record (quizRecords)
  createQuizRecord(quizRecord: any): Promise<void> {
    if (!quizRecord || !quizRecord.quizId || !quizRecord.userId) {
      return Promise.reject(
        'Quiz record must contain quizId and userId properties.'
      );
    }
    return this.addData(`quizRecords`, quizRecord.quizId, quizRecord);
  }

  // Service 2: Create Quiz Question (quizQuestions)
  createQuizQuestion(question: any): Promise<void> {
    if (!question || !question.questionId || !question.quizId) {
      return Promise.reject(
        'Quiz question must contain questionId and quizId properties.'
      );
    }
    return this.addData(`quizQuestions`, question.questionId, question);
  }

  // Service 3: Create Quiz Question Option (quizQuestionsOptions)
  createQuizQuestionOption(option: any): Promise<void> {
    if (
      !option ||
      !option.optionId ||
      !option.questionId ||
      !option.subjectid
    ) {
      return Promise.reject(
        'Quiz option must contain optionId, questionId and subjectid properties.'
      );
    }
    return this.addData(`quizQuestionsOptions`, option.optionId, option);
  }
  // Service 4: Create Quiz Answer (quizAnswers)
  createQuizAnswer(
    quizId: string,
    questionId: string,
    answerData: any
  ): Promise<void> {
    if (!quizId || !questionId || !answerData) {
      return Promise.reject(
        'Quiz answer must have quizId, questionId and answerData'
      );
    }
    return this.addData(`quizAnswers/${quizId}`, questionId, answerData);
  }
}
