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
    create(tableName: string, params: T) {
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
    // getFilteredData(tableName:string,filter: { [key: string]: any }){
    // return this.database.list(tableName).snapshotChanges().pipe(map(actions => actions.map(()=>{
    //     return filter
    // })));
    // }

}