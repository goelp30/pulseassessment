import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private clickedDataSubject = new BehaviorSubject<any>(null); // Store clicked row data (single object, not an array)
  clickedData$ = this.clickedDataSubject.asObservable();

  private quizIdSource = new BehaviorSubject<string | null>(null);
  quizId$ = this.quizIdSource.asObservable();

  setQuizId(id: string) {
    this.quizIdSource.next(id);
  }

  getQuizId(): string | null {
    return this.quizIdSource.getValue();
  }

  // Set the clicked row's data directly
  setData(data: any) {
    this.clickedDataSubject.next(data); // Store the clicked row data as an object
  }

  getData(): any {
    return this.clickedDataSubject.value; // Return the data for the clicked row
  }
}
