import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { FormsModule } from '@angular/forms';
import { assessmentRecords } from '../../../../models/assessmentRecords';
import { TableComponent } from '../../../common/table/table.component';
import { HeaderComponent } from '../../../common/header/header.component';
import { TableNames } from '../../../../enums/TableName';
import { filter, Subject, takeUntil } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-assessment-records',
  standalone: true,
  imports: [FormsModule, TableComponent, HeaderComponent],
  templateUrl: './assessment-records.component.html',
  styleUrls: ['./assessment-records.component.css'],
})
export class AssessmentRecordsComponent implements OnInit {
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
        'px-3 py-2 bg-red-500 text-white font-semibold cursor-pointer rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400',
      action: (row: any) => this.invalidateAssessment(row),
    },
  ];

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
        console.log('Processed assessments:', this.assessments);
        this.isLoading = false;
      });
  }

  invalidateAssessment(assessment: assessmentRecords) {
    const recordKey = `${assessment.assessmentId}_${assessment.userId}`;
    assessment.isValid = false;

    this.updateState(recordKey, { isValid: false })
      .then(() => {
        console.log(`Successfully invalidated assessment: ${recordKey}`);
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

  onSearch(query: string) {
    this.searchQuery = query;
  }

  // onFilterChange() {
  //   this.searchPlaceholder = this.getSearchPlaceholder();
  // }
  // getSearchPlaceholder(): string {
  //   switch (this.selectedFilter) {
  //     case 'userName':
  //       return (this.searchPlaceholder = 'Search by Name');
  //     case 'email':
  //       return (this.searchPlaceholder = 'Search by Email');
  //     case 'assessmentName':
  //       return (this.searchPlaceholder = 'Search by Assessment Name');
  //     default:
  //       return (this.searchPlaceholder = 'Search'); // fallback if selectedFilter is not found
  //   }
  // }

  isInvalidDisabled(assessment: assessmentRecords): boolean {
    return (
      assessment.status === 'Invalid' ||
      assessment.status?.includes('Expired') ||
      false
    );
  }
}
