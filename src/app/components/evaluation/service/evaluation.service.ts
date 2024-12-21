import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private clickedDataSubject = new BehaviorSubject<any>(this.loadClickedData()); // Initialize with stored data,
  public clickedData$ = this.clickedDataSubject.asObservable();

  constructor() {
    const initialData = this.loadClickedData()
    console.log("Initial data from local Storage", initialData);
    this.clickedDataSubject.next(initialData)
}
  // Set the clicked row's data directly
  setData(data: any) {
    this.clickedDataSubject.next(data); // Store the clicked row data as an object
  }

  getData(): any {
    return this.clickedDataSubject.value; // Return the data for the clicked row
  }

  setClickedData(data: any) {
    localStorage.setItem('clickedData', JSON.stringify(data));
    this.clickedDataSubject.next(data);
  }

  loadClickedData() {
    const storedData = localStorage.getItem('clickedData');
    return storedData ? JSON.parse(storedData) : null;
  }
}
