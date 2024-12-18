import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { assessmentRecords } from '../../../../models/assessmentRecords';
import { NgClass } from '@angular/common';
import { CapitalizePipe } from "../../../../capitalize.pipe";

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule, NgClass, CapitalizePipe],
  templateUrl: './assessment-records.component.html',
  styleUrls: ['./assessment-records.component.css'],
})
export class AssessmentRecordsComponent implements OnInit {
  assessments: assessmentRecords[] = [];
  filteredAssessments: assessmentRecords[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'Name';
  selectedStatus: string = '';
  filterOptions: string[] = ['Name', 'Email', 'Assessment'];
  statusOptions: string[] = ['Active', 'Expired', 'In Progress', 'Completed', 'Invalid'];
  isLoading:boolean=true;

  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.fetchAssessments();
  }

  fetchAssessments() {
    this.isLoading = true; 
    this.firebaseService
      .getAllData('assessmentRecords')
      .subscribe((data: any[]) => {
        this.assessments = data.map((assessment) => ({
          ...assessment,
          status: this.getStatus(assessment) || 'Unknown',
        }));
        this.filteredAssessments = [...this.assessments];
        this.isLoading = false;
      });
  }

  invalidateAssessment(assessment: assessmentRecords) {
    const recordKey = `${assessment.assessmentId}_${assessment.userId}`;
    assessment.isValid = false;

    this.updateState(recordKey, { isValid: false })
      .then(() => {
        console.log(`Successfully invalidated assessment: ${recordKey}`);

        // Update the status in the UI
        assessment.status = 'Invalid';

        // Optionally trigger a re-filter in case the search query is active
        this.onSearch();
      })
      .catch((error) => {
        console.error(`Error invalidating assessment ${recordKey}:`, error);
      });
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

  getStatus(assessment: assessmentRecords): string {
    const currentDate = new Date();
    const expiryDate = new Date(assessment.expiryDate);

    if (assessment.isValid === false) return 'Invalid';
    if (!assessment.isAccessed && expiryDate < currentDate) {
      return 'Expired';
    }
    if (assessment.inProgress) return 'In Progress';
    if (assessment.isCompleted) return 'Completed';
    if (assessment.isActive && expiryDate >= currentDate) {
      return 'Active';
    }
    if (assessment.isActive && expiryDate < currentDate) {
      return 'Expired';
    }
    return 'Unknown';
  }

  onSearch() {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredAssessments = this.assessments.filter((assessment) => {
      const matchesFilter = this.matchFilter(assessment, query);
      const matchesStatus = this.selectedStatus
        ? assessment.status?.toLowerCase() === this.selectedStatus.toLowerCase()
        : true;

      return matchesFilter && matchesStatus;
    });
  }

  matchFilter(assessment: assessmentRecords, query: string): boolean {
    switch (this.selectedFilter) {
      case 'Name':
        return assessment.userName.toLowerCase().includes(query);
      case 'Email':
        return assessment.email.toLowerCase().includes(query);
      case 'Assessment':
        return assessment.assessmentName.toLowerCase().includes(query);
      default:
        return false;
    }
  }

  isInvalidDisabled(assessment: assessmentRecords): boolean {
    return (
      assessment.status === 'Invalid' ||
      assessment.status?.includes('Expired') ||
      false
    );
  }
}
