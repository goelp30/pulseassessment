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
    setInterval(() => this.updateExpiredStatus(), 60000);
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

  // Check if the link is expired
  isLinkExpired(expiryDate: string | Date): boolean {
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < new Date();
  }

  async updateState(recordKey: string, updates: any): Promise<void> {
    const tableName = `assessmentRecords/${recordKey}`;
    console.log('Attempting to update:', tableName, updates);
    return await this.firebaseService
      .update(tableName, updates)
      .then(() => console.log('Successfully updated:', tableName))
      .catch((error) => {
        console.error('Failed to update Firebase:', error);
        throw error;
      });
  }

  updateExpiredStatus(): void {
    this.assessmentDetails.forEach((assessment) => {
      const { assessmentId, userId, expiryDate } = assessment;
      const recordKey = `${assessmentId}_${userId}`;
      const isExpired = this.isLinkExpired(expiryDate);

      if (assessment.isExpired !== isExpired) {
        console.log(`Updating isExpired for ${recordKey} to ${isExpired}`);
        this.updateState(recordKey, { isExpired }).catch((error) => {
          console.error(`Error updating isExpired for ${recordKey}:`, error);
        });
      }
    });
  }

  // Handle quiz access logic
  onAccessQuiz(assessment: any): void {
    const { assessmentId, userId, expiryDate, isLinkAccessed } = assessment;
    const recordKey = `${assessmentId}_${userId}`;

    if (this.isLinkExpired(expiryDate)) {
      this.router.navigate(['/linkexpired']);
      return;
    }

    if (isLinkAccessed) {
      this.router.navigate(['/alreadyattended']);
      return;
    }
    // Update both `isLinkAccessed` and `isInProgress`
    this.updateState(recordKey, { isLinkAccessed: true, isInProgress: true })
      .then(() => {
        this.router.navigate(['/quiz-home'], {
          queryParams: { id: assessmentId },
        });
      })
      .catch((error) => {
        console.error('Error marking assessment as accessed:', error);
      });
  }
}
