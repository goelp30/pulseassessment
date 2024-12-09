import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [NgFor],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
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
  isLinkExpired(expiryDate: string | Date): boolean {
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < new Date();
  }

  markAsAccessed(assessmentId: string, userId: string): void {
    const recordKey = `${assessmentId}_${userId}`;
    const tableName = `assessmentRecords/${recordKey}`;
    this.firebaseService.update(tableName, { isLinkAccessed: true }).then(
      () => {
        this.router.navigate(['/quiz'], { queryParams: { id: assessmentId } });
      },
      (error) => {
        console.error('Error updating access status:', error);
      }
    );
  }
  
  onAccessQuiz(assessment: any): void {
    if (this.isLinkExpired(assessment.expiryDate)) {
      this.router.navigate(['/linkexpired']);
    } else if (assessment.isLinkAccessed) {
      this.router.navigate(['/alreadyattended']);
    } else {
      this.markAsAccessed(assessment.assessmentId, assessment.userId);
    }
  }
  
}
