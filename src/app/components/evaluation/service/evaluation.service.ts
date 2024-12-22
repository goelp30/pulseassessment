import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private clickedDataSubject = new BehaviorSubject<any>(this.getSessionData() || null); // Initialize with sessionStorage if available
  clickedData$ = this.clickedDataSubject.asObservable();

  // Set the clicked row's data directly and save to sessionStorage
  setData(data: any) {
    this.clickedDataSubject.next(data); // Store in BehaviorSubject
    sessionStorage.setItem('clickedData', JSON.stringify(data)); // Store in sessionStorage
  }

  // Retrieve the data from BehaviorSubject or sessionStorage
  getData(): any {
    return this.clickedDataSubject.value; // Return the data for the clicked row
  }

  // Method to get data from sessionStorage (if it exists)
  private getSessionData(): any {
    const storedData = sessionStorage.getItem('clickedData');
    return storedData ? JSON.parse(storedData) : null; // Parse and return or null if not available
  }

  // Clear session storage when needed
  clearSessionData() {
    sessionStorage.removeItem('clickedData');
    this.clickedDataSubject.next(null); // Reset the BehaviorSubject
  }
}
