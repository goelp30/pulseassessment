import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subject } from '../app/models/subject';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class SubjectService {

    documentToDomainObject = (_: any) => {
        const object = _.payload.val();
        return object;
    }

    constructor(private database: AngularFireDatabase) {
        // this.updateSubject(0,'newtext').then((res) => console.log('test', res));
     }

    /***
     * create new subject
     */
    createSubject(subjectId: number, subjectText: string) {
        return this.database.object('subject/' + subjectId).set({
            subjectId: subjectId,
            subjectText: subjectText,
            createdDate: new Date(),
            updatedDate: new Date()
        });
    }

    /***
     * Update new subject
     */
    updateSubject(subjectId: number, subjectText: string) {
        return this.database.object('subject/' + subjectId).update({
            subjectId: subjectId,
            subjectText: subjectText
        });
    }

    /***
     * listens subject changes
     */
    listensToSubjectChange(): Observable<Subject[]> {
        return this.database.list('subject').valueChanges() as Observable<Subject[]>;
    }

    /***
     * Once get subject all
     */
    getAllSubjectChange() {
        return this.database.list('subject').snapshotChanges().pipe(map(actions => actions.map(this.documentToDomainObject)));
    }
}