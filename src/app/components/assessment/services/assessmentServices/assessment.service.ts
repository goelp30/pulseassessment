import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private assessmentIdSource = new BehaviorSubject<string | null>(null);
  assessmentId$ = this.assessmentIdSource.asObservable();

  setAsssessmentId(id: string) {
    this.assessmentIdSource.next(id);
  }

  getAssessmentId(): string | null {
    return this.assessmentIdSource.getValue();
  }
}
