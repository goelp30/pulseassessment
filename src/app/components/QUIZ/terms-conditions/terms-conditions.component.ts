import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [NgFor],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.css'
})
export class TermsConditionsComponent implements OnInit {
  assessmentDetails: any[] = [];

  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAssessments();
  }

  // Fetch all assessments from the database
  getAssessments(): void {
    this.firebaseService.getAllData('assessmentRecords').subscribe(
      (data) => {
        this.assessmentDetails = data;
      },
      (error) => console.error('Error fetching assessments:', error)
    );
  }

  // Method to check if the link is expired
  isLinkExpired(expiryDate: string): boolean {
    const currentDate = new Date();
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < currentDate;
  }

  // Handle the redirection based on expiry
  onAccessQuiz(assessment: any): void {
    if (this.isLinkExpired(assessment.expiryDate)) {
      // Redirect to the link expiry route
      this.router.navigate(['/linkexpired']);
    } else {
      // Redirect to the quiz route
      this.router.navigate(['/quiz'], {
        queryParams: { id: assessment.assessmentId },
      });
    }
  }
}
