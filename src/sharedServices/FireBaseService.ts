import { Injectable, Type } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';
import { Options, Question } from '../app/models/question.model';

@Injectable({
    providedIn: 'root'
})

export class FireBaseService<T> {
    getData(arg0: string) {
      throw new Error('Method not implemented.');
    }

    private documentToDomainObject = (_: any) => {
        const object = _.payload.val();
        return object;
      }

    constructor(private database: AngularFireDatabase) {
    }

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
        return this.database.list(tableName).snapshotChanges().pipe(map(actions => actions.map(this.documentToDomainObject)));
    }
    addData(tableName: string, id: string, params: T): Promise<void> {
        return this.database.object(`${tableName}/${id}`).set(params);
      }

      
      
  // Get question by its ID
  getQuestionById(questionId: number): Observable<Question> {
    return this.database
      .object(`questions/${questionId}`)
      .snapshotChanges()
      .pipe(map(this.documentToDomainObject));
  }

  // Get options for a specific question
  getOptionsByQuestionId(questionId: number): Observable<Options[]> {
    return this.database
      .list('options', ref => ref.orderByChild('questionId').equalTo(questionId))
      .snapshotChanges()
      .pipe(map(actions => actions.map(this.documentToDomainObject)));
  }

  
}