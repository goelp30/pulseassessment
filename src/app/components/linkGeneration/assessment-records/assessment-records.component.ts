import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule,NgIf,NgFor],
  templateUrl: './assessment-records.component.html',
  styleUrl: './assessment-records.component.css'
})
export class AssessmentRecordsComponent implements OnInit {
  assessments: any[] = [];  // This will hold the fetched data
  filteredAssessments: any[] = []; // This will hold the filtered results
  searchQuery: string = ''; // Bind to the search input

  constructor(private firebaseService: FireBaseService<any>) {}

  ngOnInit(): void {
    // Fetch data from Firebase when component initializes
    this.fetchAssessments();
  }

  // Fetch assessments from Firebase
  fetchAssessments() {
    this.firebaseService.getAllData('assessmentRecords').subscribe((data: any[]) => {
      this.assessments = data;
      this.filteredAssessments = data;
    });
  }

  // Method to check if the link is expired
  isLinkExpired(expiryDate: string): boolean {
    const currentDate = new Date().toISOString();
    return expiryDate < currentDate;
  }

  // Filter assessments based on search query
  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.filteredAssessments = this.assessments;
    } else {
      this.filteredAssessments = this.assessments.filter((assessment) => {
        return (
          assessment.assessmentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          assessment.userName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
  }
}
