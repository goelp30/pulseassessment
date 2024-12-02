import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Assessment } from '../../../models/assessment';
import { AssessTableComponent } from '../assess-table/assess-table.component';
import { ToastrModule,ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.css'],
  imports: [CommonModule , FormsModule,AssessTableComponent,ToastrModule,RouterLink]
})
export class AssessmentListComponent implements OnInit {
  // assessment
  assessments: Assessment[] = [];
  // subjects:Subject[]=[];
  isEditing: boolean = false;

  constructor(private fireBaseService: FireBaseService<Assessment>,private toastr: ToastrService) {}
  listenToAssessmentChanges() {
    this.fireBaseService.listensToChange(TableNames.Assessment).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }
  ngOnInit(): void {

    // assessment
    this.fireBaseService.listensToChange(TableNames.Assessment).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
    // to have updated subjects
    // this.fireBaseService.listensToChange(TableNames.Subject).subscribe((res) => {
    //   this.subjects = res as Subject[];
    //   console.log(this.subjects);
    // });
  }

  // assessment code-team2
  addAssessment() {

    const uniqueId = crypto.randomUUID();
    
    const assessment: Assessment = {
      assessmentId: uniqueId,
      assessmentName: 'Sample Assessment 123',
      assessmentType: 'internal',
      dateCreated: Date.now(),
      dateUpdated:Date.now(),
      isDisabled:false,
      isautoEvaluated:true
    };

    // Save the new assessment to Firebase
    this.fireBaseService.create(TableNames.Assessment + '/' + uniqueId, assessment);

    // Optionally, you can push the new assessment into the local array for immediate UI update
    this.assessments.push(assessment);
  }

  /**
   * Get all assessments
   */
  getAssessments() {
    this.fireBaseService.getAllData(TableNames.Assessment).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }

  /**
   * Listen to assessment changes (real-time updates)
   */
  showSuccess() {this.toastr.info('Hello world!', 'Toastr fun!',{timeOut:1000});}




}
