import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule,NgIf,NgFor],
  templateUrl: './assessment-records.component.html',
  styleUrl: './assessment-records.component.css'
})
export class AssessmentRecordsComponent implements OnInit {
[x: string]: any;
  assessments: any[] = [];  // This will hold the fetched data
  filteredAssessments: any[] = []; // This will hold the filtered results
  searchQuery: string = ''; // Bind to the search input
  isLinkDisabled: boolean = false; // Add the flag to manage the link state

  constructor(private firebaseService: FireBaseService<any>,private router: Router) {}

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


  isLinkExpired(expiryDate: string): boolean {
    const currentDate = new Date().toISOString();
    return expiryDate < currentDate;
  }
  
  // Method to handle the link click
  onLinkClick(assessment: any): void {
    if (this.isLinkExpired(assessment.expiryDate)) {
      // Mark the link as disabled
      assessment.isLinkDisabled = true;
  
      // Use the Router to navigate to the expired link page
    this.router.navigate(['/linkexpired']);
    } else {
       //? If link is not expired, navigate to the  TERMS and CONDITIONS PAGE (Tanya and Team's Page)
    const decodedUrl = decodeURIComponent(assessment.urlId);
    // this.router.navigateByUrl(decodedUrl);
    this.router.navigate(['/generatelink']);
    }
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
