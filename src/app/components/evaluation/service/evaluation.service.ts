// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// @Injectable({
//   providedIn: 'root'
// })
// export class EvaluationService {
//   private clickedDataSubject = new BehaviorSubject<any>(null);
//   clickedData$ = this.clickedDataSubject.asObservable();
 
//   private quizIdSource = new BehaviorSubject<string | null>(null);
//  quizId$ = this.quizIdSource.asObservable();
 
//   setQuizId(id: string) {
//     this.quizIdSource.next(id);
//   }
 
//   getQuizId(): string | null {
//     return this.quizIdSource.getValue();
//   }
//   setData(data: any) {
//     this.clickedDataSubject.next(data);
//   }
//   // Method to get the clicked data
//   getData():any[] {
//     return this.clickedDataSubject.value;
//   }
// }
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class EvaluationService {
//   private clickedDataSubject = new BehaviorSubject<any[]>([]); // Array of objects
//   clickedData$ = this.clickedDataSubject.asObservable();

//   private quizIdSource = new BehaviorSubject<string | null>(null);
//   quizId$ = this.quizIdSource.asObservable();

//   setQuizId(id: string) {
//     this.quizIdSource.next(id);
//   }

//   getQuizId(): string | null {
//     return this.quizIdSource.getValue();
//   }

//   setData(data: any[]) {
//     this.clickedDataSubject.next(data); // Update with an array of objects
//   }

//   getData(): any[] {
//     return this.clickedDataSubject.value; // Return the array of objects
//   }
// }
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class EvaluationService {
//   private clickedDataSubject = new BehaviorSubject<any[]>([]); // Still using an array, but can be a single object if you wish
//   clickedData$ = this.clickedDataSubject.asObservable();

//   private quizIdSource = new BehaviorSubject<string | null>(null);
//   quizId$ = this.quizIdSource.asObservable();

//   setQuizId(id: string) {
//     this.quizIdSource.next(id);
//   }

//   getQuizId(): string | null {
//     return this.quizIdSource.getValue();
//   }

//   // Set data for a single row (can be passed as a single element array)
//   setData(data: any[]) {
//     this.clickedDataSubject.next(data); // Now sets an array containing just the clicked row
//   }

//   // Get the clicked data (which will be an array, but can just access the first item)
//   getData(): any[] {
//     return this.clickedDataSubject.value;
//   }
// }
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
