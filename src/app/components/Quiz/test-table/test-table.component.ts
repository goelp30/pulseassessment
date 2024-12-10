import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { ButtonComponent } from "../../common/button/button.component";
import { TableNames } from '../../../enums/TableName'; // Adjust the path as needed
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-test-table',
  standalone: true,
  imports: [ButtonComponent,CommonModule],
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.css'],
})
export class TestTableComponent implements OnInit {
  assessments: Assessment[] = [];
  tableName = TableNames.Assessment; // Use the enum for table/collection name

  constructor(
    private fireBaseService: FireBaseService<Assessment>,
    private cdr: ChangeDetectorRef,
    private router: Router // Inject Router
  ) {}

  ngOnInit() {
    this.getAssessments();
  }

  // Fetch assessments from Firebase
  getAssessments() {
    this.fireBaseService.getAllData(this.tableName).subscribe(
      (res: Assessment[]) => {
        // Filter assessments to exclude disabled ones
        this.assessments = res.filter((assessment) => !assessment.isDisabled);

        // Trigger manual change detection if required
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching assessments:', error);
      }
    );
  }

  // Action for starting a quiz
  startQuiz(row: Assessment) {
    console.log('Starting quiz for:', row.assessmentName, 'ID:', row.assessmentId);
  
    // Navigate to the quiz-home route with query parameters
    this.router.navigate(['/quiz-home'], {
      queryParams: { id: row.assessmentId, name: row.assessmentName },
    });
  }
}  
