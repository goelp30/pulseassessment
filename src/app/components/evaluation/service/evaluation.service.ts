import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'  // This makes sure the service is available app-wide
})
export class EvaluationService {
  private clickedData: any;  // Private variable to hold the data
// Method to set the clicked data
 setData(data: any) {
    this.clickedData = data;
  }
// Method to get the clicked data
  getData() {
    return this.clickedData;
  }
}
