import { Injectable, Type } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { catchError, map, Observable } from 'rxjs';
import { Option, Question } from '../app/models/question';

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

  /**
   * To Add Data
   */
  addData(tableName: string, id: string, params: T): Promise<void> {
    return this.database.object(`${tableName}/${id}`).set(params);
  }

  getQuestionById(questionId: number): Observable<Question> {
    return this.database
      .object(`questions/${questionId}`)
      .snapshotChanges()
      .pipe(map(this.documentToDomainObject));
  }

  // Get options for a specific question
  getOptionsByQuestionId(questionId: number): Observable<Option[]> {
    return this.database
      .list('options', (ref) =>
        ref.orderByChild('questionId').equalTo(questionId)
      )
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }
  //get all questions and useranswer from quiz id
  getItemsByQuizId(path: string, quizId: string): Observable<any[]> {
    return this.database
      .list(`${path}/${quizId}`) // Access the nested structure by quizId
      .snapshotChanges() // Get the snapshot of the data
      .pipe(
        map((actions) =>
          actions.map((action) => {
            const data = action.payload.val(); // Get the data from the snapshot
            return data;
          })
        ),
        catchError((error) => {
          console.error('Error fetching items by quizId:', error);
          throw error; // Handle errors appropriately
        })
      );
  }
  // Fetch all options for all questions
  getAllOptions(tableName: string): Observable<any[]> {
    return this.database
      .list(tableName) // Dynamically use the provided table name
      .snapshotChanges()
      .pipe(map((actions) => actions.map(this.documentToDomainObject)));
  }
  //to get all questions from their ids
  getQuestionsFromIds(tableName: string, ids: string[]): Observable<any[]> {
    return this.database
      .list(tableName, (ref) => ref.orderByKey()) // Query the dynamic table
      .snapshotChanges()
      .pipe(
        map((actions) => {
          // Filter actions to include only those with keys in `ids`
          const filteredActions = actions.filter((action) =>
            ids.includes(action.key!)
          );
          return filteredActions.map((action) => {
            const data = this.documentToDomainObject(action); // Convert snapshot to data
            return {
              questionId: action.key, // Include the questionId (key)
              ...data, // Include other fields dynamically
            };
          });
        })
      );
  }
  //update all marks together
  async batchUpdate(updates: { [path: string]: any }): Promise<void> {
    // The 'object' method is used for single object updates
    const updatePromises = Object.keys(updates).map((path) => {
      return this.database.object(path).update(updates[path]);
    });

    // Wait for all the updates to complete
    await Promise.all(updatePromises);
  }
  getAssessmentNameById(assessmentId: string): Observable<string> {
    return this.database
      .object(`assessment/${assessmentId}`)  // Access the document by the assessmentId
      .valueChanges()  // Get the values of the assessment document
      .pipe(
        map((assessmentData: any) => {
          return assessmentData && assessmentData.assessmentName
            ? assessmentData.assessmentName
            : 'Unknown'; // Return 'Unknown' if no assessmentName is found
        })
      );
  }
}
