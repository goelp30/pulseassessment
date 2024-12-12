import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private subjectIdSource = new BehaviorSubject<string | null>(null);
  subjectId$ = this.subjectIdSource.asObservable();

  private subjectNameSource = new BehaviorSubject<string | null>(null);
  subjectName$ = this.subjectNameSource.asObservable();

  // Set subject ID
  setSubjectId(id: string) {
    this.subjectIdSource.next(id);
  }

  // Get subject ID
  getSubjectId(): string | null {
    return this.subjectIdSource.getValue();
  }

  // Set subject name
  setSubjectName(name: string) {
    this.subjectNameSource.next(name);
  }

  // Get subject name
  getSubjectName(): string | null {
    return this.subjectNameSource.getValue();
  }
}
