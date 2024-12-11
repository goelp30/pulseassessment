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
  checkLinkExpiry(): void {
    this.firebaseService.getAllData('assessmentRecords').subscribe(
      (data) => {
        const assessmentRecord = data.find(
          (assessment) =>
            assessment.userId === this.userId &&
            assessment.assessmentId === this.assessmentId
        );
  
        if (assessmentRecord) {
          const { expiryDate, isLinkAccessed, isInProgress, isActive } = assessmentRecord;
  
          if (this.isLinkExpired(expiryDate, isLinkAccessed)) {
            const recordKey = `${this.assessmentId}_${this.userId}`;
            this.updateState(recordKey, {
              isExpired: true,
              isActive: false,  // Deactivate link if never accessed and expired
            })
              .then(() => this.router.navigate(['/linkexpired']))
              .catch((error) =>
                console.error('Error updating isExpired and isActive:', error)
              );
          } else if (isLinkAccessed) {
            // If link is already accessed, it should not be accessed again
            this.router.navigate(['/alreadyattended']);
          } else {
            // If the link is neither expired nor accessed, continue with rendering
            this.updateState(`${this.assessmentId}_${this.userId}`, {
              isActive: true,  // Mark as active if valid
              isInProgress: true,  // Mark as in progress if not expired and active
            }).catch((error) =>
              console.error('Error updating status to active and in progress:', error)
            );
          }
        } else {
          this.router.navigate(['/linkexpired']);
        }
      },
      (error) => {
        console.error('Error fetching assessments:', error);
        this.router.navigate(['/linkexpired']);
      }
    );
  }
  
  // Check if the link is expired
  isLinkExpired(expiryDate: string | Date, isLinkAccessed: boolean): boolean {
    const expiryDateObj = new Date(expiryDate);
    // If link is not accessed and expiry date has passed, consider it expired
    return !isLinkAccessed && expiryDateObj < new Date();
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
      const { assessmentId, userId, expiryDate,isLinkAccessed } = assessment;
      const recordKey = `${assessmentId}_${userId}`;
      const isExpired = this.isLinkExpired(expiryDate,isLinkAccessed);
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
    const { assessmentId, userId, expiryDate, isLinkAccessed, isInProgress } = assessment;
    const recordKey = `${assessmentId}_${userId}`;
  
    if (this.isLinkExpired(expiryDate, isLinkAccessed)) {
      this.router.navigate(['/linkexpired']);
      return;
    }
  
    if (isLinkAccessed) {
      // If the link has already been accessed, redirect to 'alreadyattended'
      this.router.navigate(['/alreadyattended']);
      return;
    }
  
    // If the link is valid and not yet accessed, update the state
    this.updateState(recordKey, {
      isLinkAccessed: true,  // Mark the link as accessed
      isInProgress: true,    // Mark it as in progress when accessed
    })
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
