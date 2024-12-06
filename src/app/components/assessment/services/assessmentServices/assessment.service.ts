import { Injectable } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { AssessmentList } from '../../../../models/newassessment';
@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  constructor(private firebaseService: FireBaseService<AssessmentList>) { }

  addDataToAssessmentTable(assessmentData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const assessmentId = assessmentData.assessmentId;

      // Save data to Firebase
      this.firebaseService.addData('assessmentList', assessmentId, assessmentData)
        .then(() => {
          resolve(assessmentId); // Return the generated ID
        })
        .catch((error) => {
          reject('Error saving assessment data: ' + error);
        });
    });
  }
}
