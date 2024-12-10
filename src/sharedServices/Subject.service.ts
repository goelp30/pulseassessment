import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class SubjectService {
  private subjectIdSource = new BehaviorSubject<string | null>(null);
  subjectId$ = this.subjectIdSource.asObservable();

  setSubjectId(id: string) {
    this.subjectIdSource.next(id);
  }

  getSubjectId(): string | null {
    return this.subjectIdSource.getValue();
  }
}
