import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
})
export class TermsConditionsComponent implements OnInit {
  assessmentDetails: any[] = [];
  userId: string = '';  // Store the user ID from the URL
  assessmentId: string = '';  // Store the assessment ID from the URL

  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router,
    private activatedRoute: ActivatedRoute  // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getParamsFromUrl();  // Get parameters from URL first
  }

  // Extract the userId and assessmentId from the URL
  getParamsFromUrl(): void {
    this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId'];  // Extract userId (currently visible in URL)
      this.assessmentId = params['assessmentId'];  // Extract assessmentId (the ID of the current assessment)
      console.log(`User ID: ${this.userId}, Assessment ID: ${this.assessmentId}`);
      
      // Immediately check the expiry and access conditions before rendering the page
      this.checkLinkExpiry();  // Check if the link has expired
    });
  }

  // Check if the link has expired and update the database
checkLinkExpiry(): void {
  // Assuming Firebase service call is used to get the assessment record for the given userId and assessmentId
  this.firebaseService.getAllData('assessmentRecords').subscribe(
    (data) => {
      const assessmentRecord = data.find(
        (assessment) =>
          assessment.userId === this.userId && assessment.assessmentId === this.assessmentId
      );

      if (assessmentRecord) {
        const { expiryDate, isLinkAccessed, assessmentId, userId } = assessmentRecord;

        // Check if the link is expired
        if (this.isLinkExpired(expiryDate)) {
          // If the link has expired, update the 'isExpired' field in the database
          const recordKey = `${assessmentId}_${userId}`;
          this.updateState(recordKey, { isExpired: true }).then(() => {
            // After updating the status, navigate to the link expired page
            this.router.navigate(['/linkexpired']);
          }).catch((error) => {
            console.error('Error updating isExpired status:', error);
            // Handle error if any during update
            this.router.navigate(['/linkexpired']);
          });
        } else if (isLinkAccessed) {
          this.router.navigate(['/alreadyattended']);  // Redirect if already attended
        } else {
          // If everything is valid, continue with rendering the Terms and Conditions page
          this.getAssessments();  // Fetch assessments if link is valid
        }
      } else {
        // If no record found, redirect to error or another appropriate page
        this.router.navigate(['/linkexpired']);
      }
    },
    (error) => {
      console.error('Error fetching assessments:', error);
      this.router.navigate(['/linkexpired']);  // Handle Firebase error by redirecting
    }
  );
}


  // Check if the link is expired
  isLinkExpired(expiryDate: string | Date): boolean {
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < new Date();
  }

  // Fetch all assessments from the database (for the valid scenario)
  getAssessments(): void {
    this.firebaseService.getAllData('assessmentRecords').subscribe(
      (data) => {
        this.assessmentDetails = data;
      },
      (error) => console.error('Error fetching assessments:', error)
    );
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
      const isActive = !isExpired; // Active only if not expired
  
      // Check if `isExpired` or `isActive` needs an update
      if (assessment.isExpired !== isExpired || assessment.isActive !== isActive) {
        console.log(`Updating isExpired and isActive for ${recordKey}`);
        this.updateState(recordKey, { isExpired, isActive }).catch((error) => {
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