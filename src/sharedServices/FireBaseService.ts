import { Injectable, Type } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class FireBaseService<T> {

    documentToDomainObject = (_: any) => {
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

    /**
     * To Add Data
     */
    addData(tableName: string, id: string, params: T): Promise<void> {
        return this.database.object(`${tableName}/${id}`).set(params);
      }

    //   async createques(tableName: string, id: string, params: any): Promise<void> {
    //     try {
    //       await this.database.object(`${tableName}/${id}`).set(params);
    //       console.log(`Data stored at ${tableName}/${id}`);
    //     } catch (error) {
    //       console.error('Error while storing data:', error);
    //     }
    //   }
      

}
