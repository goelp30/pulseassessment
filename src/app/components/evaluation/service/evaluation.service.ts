import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private clickedDataSubject = new BehaviorSubject<any>(this.getSessionData() || null); 
  clickedData$ = this.clickedDataSubject.asObservable();

  setData(data: any) {
    this.clickedDataSubject.next(data); 
    sessionStorage.setItem('clickedData', JSON.stringify(data)); 
  }

  getData(): any {
    return this.clickedDataSubject.value; 
  }

  private getSessionData(): any {
    const storedData = sessionStorage.getItem('clickedData');
    return storedData ? JSON.parse(storedData) : null; 
  }

  clearSessionData() {
    sessionStorage.removeItem('clickedData');
    this.clickedDataSubject.next(null); 
  }
}
