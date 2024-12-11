import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { NgClass} from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [NgClass],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
})
export class TermsConditionsComponent implements OnInit {
  assessmentDetails: any[] = [];
  userId: string | null = null; // To store the user ID from the query parameters
  assessmentId: string | null = null; // To store the assessment ID from the query parameters

  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getAssessments();
    this.getParamsFromUrl()
    setInterval(() => this.updateExpiredStatus(), 1000);
  }

  getParamsFromUrl(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['userId']; // Extract userId (currently visible in URL)
      this.assessmentId = params['assessmentId']; // Extract assessmentId (the ID of the current assessment)
      console.log(
        `User ID: ${this.userId}, Assessment ID: ${this.assessmentId}`
      );
    });
  }

  // Fetch all assessments from the database
  getAssessments(): void {
    this.firebaseService.getAllData('assessmentRecords').subscribe(
      (data) => {
        this.assessmentDetails = data;
        console.log('Assessment Details:', this.assessmentDetails);
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
      const isActive = !isExpired; // Active only if not expired
      const isInProgress = assessment.isInProgress && !isExpired ? true : false; // False if expired

      // Check if `isExpired`, `isActive`, or `isInProgress` needs an update
      if (
        assessment.isExpired !== isExpired ||
        assessment.isActive !== isActive ||
        assessment.isInProgress !== isInProgress
      ) {
        console.log(
          `Updating isExpired, isActive, and isInProgress for ${recordKey}`
        );
        this.updateState(recordKey, {
          isExpired,
          isActive,
          isInProgress,
        }).catch((error) => {
          console.error(`Error updating status for ${recordKey}:`, error);
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
        this.router.navigate(['/app-quiz'], {
          queryParams: { id: assessmentId },
        });
      })
      .catch((error) => {
        console.error('Error marking assessment as accessed:', error);
      });
  }
}
