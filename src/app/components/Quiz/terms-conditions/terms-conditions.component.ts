import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule } from '@angular/common';
import { assessmentRecords } from '../../../models/assessmentRecords';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
})
export class TermsConditionsComponent implements OnInit {
  userId: string = '';
  assessmentId: string = '';
  isLoading: boolean = true;
  assessmentDetails: assessmentRecords[] = [];

  constructor(
    private firebaseService: FireBaseService<assessmentRecords>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getParamsFromUrl();
  }

  // Extract parameters from the URL
  getParamsFromUrl(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.isLoading = true;
      this.userId = params['userId'];
      this.assessmentId = params['assessmentId'];
      this.checkLinkStatus();
    });
  }

  checkLinkStatus(): void {
    this.firebaseService.getAllData('assessmentRecords').subscribe(
      (data) => {
        this.assessmentDetails = data;
        const assessmentRecord = data.find(
          (assessment) =>
            assessment.userId === this.userId &&
            assessment.assessmentId === this.assessmentId
        );

        if (assessmentRecord) {
          const { expiryDate, isAccessed, isValid } = assessmentRecord;

          if (this.isLinkExpired(expiryDate)) {
            this.router.navigate(['/linkexpired']);
          } else if (isValid && isAccessed) {
            this.router.navigate(['/alreadyattended']);
          } else if (!isValid) {
            this.router.navigate(['/invalid']);
          } else {
            this.isLoading = false;
          }
        } else {
          this.router.navigate(['/invalid']);
        }
      },
      (error) => {
        console.error('Error fetching assessments:', error);
        this.router.navigate(['/invalid']);
      }
    );
  }

  isLinkExpired(expiryDate: string | Date): boolean {
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < new Date();
  }

  onAcceptTerms(): void {
    this.isLoading=true
    const recordKey = `${this.assessmentId}_${this.userId}`;
    this.firebaseService
      .update(`assessmentRecords/${recordKey}`, {
        isAccessed: true,
        inProgress: true,
      })
      .then(() => {
        this.router.navigate(['/app-quiz'], {
          queryParams: { assessmentId: this.assessmentId, userId: this.userId },
        });
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error updating link access:', error);
      });
  }
}
