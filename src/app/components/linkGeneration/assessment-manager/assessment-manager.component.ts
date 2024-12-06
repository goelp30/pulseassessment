import { Component } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-manager',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './assessment-manager.component.html',
  styleUrls: ['./assessment-manager.component.css'],
})
export class AssessmentManagerComponent {
  assessments: any[] = []; // This will hold the fetched data
  filteredAssessments: any[] = []; // This will hold the filtered results
  searchQuery: string = ''; // Bind to the search input

  constructor(private firebaseService: FireBaseService<any>) {}

  ngOnInit(): void {
    // Fetch data from Firebase when component initializes
    this.fetchAssessments();
  }

  // Method to fetch all assessments
  fetchAssessments() {
    this.firebaseService.getAllData('assessmentRecords').subscribe((data: any[]) => {
      this.assessments = data;
      this.filteredAssessments = data; // Initialize with all data
    });
  }

  // Method to filter assessments based on search query
  onSearch() {
    if (this.searchQuery.trim() === '') {
      this.filteredAssessments = this.assessments;
    } else {
      this.filteredAssessments = this.assessments.filter((assessment) => {
        const assessmentNameMatch = assessment.assessmentName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const userNameMatch = assessment.userName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        return assessmentNameMatch || userNameMatch;
      });
    }
  }

  // Method to check if the assessment link is expired
  isLinkExpired(expiryDate: string): string {
    const currentDate = new Date();
    const expiryDateObj = new Date(expiryDate);
    console.log('Current date: ',currentDate)
    console.log('Expiry date: ',expiryDateObj)
    return expiryDateObj < currentDate ? 'Expired' : 'Active';
  }
}
