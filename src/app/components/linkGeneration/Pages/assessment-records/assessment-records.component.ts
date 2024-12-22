import { Component, OnDestroy, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { assessmentRecords } from '../../../../models/assessmentRecords';
import { TableComponent } from '../../../common/table/table.component';
import { TableNames } from '../../../../enums/TableName';
import { filter, Subject, takeUntil } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule, TableComponent],
  templateUrl: './assessment-records.component.html',
  styleUrls: ['./assessment-records.component.css'],
})
export class AssessmentRecordsComponent implements OnInit, OnDestroy {
  assessments: assessmentRecords[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'Search...'; // Default to 'userName'
  selectedStatus: string = '';
  filterOptions: string[] = ['userName', 'email', 'assessmentName'];

  statusOptions: string[] = [
    'Active',
    'Expired',
    'In Progress',
    'Completed',
    'Invalid',
  ];
  isLoading: boolean = true;

  tableName: string = TableNames.Assessment;
  tableColumns: string[] = [
    'assessmentName',
    'userName',
    'email',
    'status',
    'url',
  ];

  columnAliases: { [key: string]: string[] } = {
    assessmentName: ['Assessment Name'],
    userName: ['User Name'],
    email: ['Email'],
    status: ['Status'],
    url: ['Url'],
  };

  searchPlaceholder: string = this.selectedFilter;

  buttons = [
    {
      label: ' Invalid',
      colorClass:
        'px-3 py-2 bg-red-500 text-white font-semibold cursor-pointer rounded-md shadow hover:opacity-80 transition-opacity',
      action: (row: any) => this.invalidateAssessment(row),
      customClassFunction: (row: any) => {
        return this.isInvalidDisabled(row)
          ? 'px-3 py-2 bg-red-500 text-white font-semibold cursor-pointer rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 opacity-50 disabled-button'
          : 'px-3 py-2 bg-red-500 text-white font-semibold cursor-pointer rounded-md shadow hover:opacity-80 transition-opacity';
      },
      disableFunction: (row: any) => this.isInvalidDisabled(row),
    },
  ];

  statusMapping: { [key: string]: string } = {
    Active: 'text-green-600 font-semibold',
    Expired: 'text-red-600 font-semibold',
    'In Progress': 'text-yellow-600 font-semibold',
    Completed: 'text-blue-600 font-semibold',
    Invalid: 'text-blue-900 font-semibold',
  };

  private destroy$ = new Subject<void>(); // Subject to manage subscriptions
  constructor(
    private firebaseService: FireBaseService<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchAssessments();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe(() => {
        this.fetchAssessments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Emit value to complete all subscriptions
    this.destroy$.complete(); // Complete the subject
  }

  fetchAssessments() {
    this.isLoading = true;
    this.firebaseService
      .getAllData('assessmentRecords')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: assessmentRecords[]) => {
        this.assessments = data.map((assessment) => ({
          ...assessment,
          status: this.getStatus(assessment) || 'Unknown',
          email: assessment.email || 'No email provided',
          userName: assessment.userName || 'No userName provided',
        }));
        this.isLoading = false;
      });
  }

  invalidateAssessment(assessment: assessmentRecords) {
    if (this.isInvalidDisabled(assessment)) return;
    const recordKey = `${assessment.assessmentId}_${assessment.userId}`;
    assessment.isValid = false;

    this.updateState(recordKey, { isValid: false })
      .then(() => {
        assessment.status = 'Invalid';
      })
      .catch((error) => {
        console.error(`Error invalidating assessment ${recordKey}:`, error);
      });
  }

  async updateState(recordKey: string, updates: any): Promise<void> {
    const tableName = `assessmentRecords/${recordKey}`;
    return await this.firebaseService
      .update(tableName, updates)
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

  onSearch(query: string) {
    this.searchQuery = query;
  }

  isInvalidDisabled(assessment: assessmentRecords): boolean {
    return (
      assessment.status === 'Invalid' ||
      assessment.status?.includes('Expired') ||
      false
    );
  }
}
