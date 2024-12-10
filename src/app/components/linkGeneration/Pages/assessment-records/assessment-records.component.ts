import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { assessmentRecords } from '../../../../models/assessmentRecords';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule,NgClass],
  templateUrl: './assessment-records.component.html',
  styleUrls: ['./assessment-records.component.css']
})
export class AssessmentRecordsComponent implements OnInit {
  assessments: assessmentRecords[] = []; // This will hold the fetched data
  filteredAssessments: assessmentRecords[] = []; // This will hold the filtered results
  searchQuery: string = ''; // Bind to the search input

  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fetch data from Firebase when the component initializes
    this.fetchAssessments();
  }

  // Fetch assessments from Firebase
  fetchAssessments() {
    this.firebaseService.getAllData('assessmentRecords').subscribe((data: any[]) => {
      this.assessments = data.map((assessment) => ({
        ...assessment,
        status: this.getStatus(assessment)
      }));
      this.filteredAssessments = [...this.assessments];
    });
  }

  // Determine the dynamic status of the assessment
  getStatus(assessment: assessmentRecords): string {
    if (assessment.invalidated) return 'Invalidated';
    if (assessment.isExpired) return 'Expired';
    if (assessment.isInProgress) return 'In Progress';
    if (assessment.isCompleted) return 'Completed';
    if (assessment.isActive) return 'Active';
    return 'Unknown';
  }

  // Filter assessments based on the search query
  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.filteredAssessments = [...this.assessments];
    } else {
      this.filteredAssessments = this.assessments.filter((assessment) => {
        return (
          assessment.assessmentName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          assessment.userName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );
      });
    }
  }
}
