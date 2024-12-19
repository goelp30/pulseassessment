import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  isLoading: boolean = false;
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
      this.userId = params['userId'];
      this.assessmentId = params['assessmentId'];
    });
  }

  onAcceptTerms(): void {
    this.isLoading = true;
    const recordKey = `${this.assessmentId}_${this.userId}`;
    this.firebaseService
      .update(`assessmentRecords/${recordKey}`, {
        isAccessed: true,
        inProgress: true,
      })
      .then(() => {
        this.router.navigate(['/app-quiz'], {
          state: { assessmentId: this.assessmentId, userId: this.userId },
        });
      })
      .catch((error) => {
        console.error('Error updating link access:', error);
      });
    this.isLoading = false;
  }
}
