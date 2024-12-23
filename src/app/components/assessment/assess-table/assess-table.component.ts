import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AssessmentList } from '../../../models/newassessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../services/assessmentServices/assessment.service';

@Component({
  selector: 'app-assess-table',
  standalone: true,
  imports: [
    TableComponent,
    PopupModuleComponent,
    CommonModule,
    FormsModule,
    ToastrModule,
  ],
  templateUrl: './assess-table.component.html',
  styleUrls: ['./assess-table.component.css'],
})
export class AssessTableComponent {
  assessmentListTable = TableNames.AssessmentList;
  assessments: Assessment[] = [];
  subjects: any[] = []; // Store the related subjects of the selected assessment
  tableColumns: string[] = ['assessmentName', 'assessmentType'];
  columnAliases: { [key: string]: string[] } = {
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type'],
  };
  tableData = this.assessments;
  tableName: string = TableNames.Assessment;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isLoading = false;
  selectedAssessment: Assessment = {
    // Initialize with a default empty object
    assessmentId: '',
    assessmentName: '',
    assessmentType: 'internal',
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    isDisabled: false,
    isautoEvaluated: true,
    isLinkGenerated: false,
    isTimeBound:true
  };
  isEditMode: boolean = false;
  eConfirmationVisible: boolean = false;
  selectedAssessmentToDelete: Assessment | null = null;
  searchPlaceholder: string = 'Search Assessments...';


  // For handling tabs
  selectedTab: string = 'all';
  // disableFunction: (row: any) => this.isEditDisabled(row),
  buttons = [
    {
      label: '',
      icon:'fa fa-pen px-2 text-lg',
      colorClass: 'bg-custom-blue hover:opacity-80 transition-opacity text-white rounded-md px-4 py-1 ',
      title:"Edit",
      action: (row: any) => this.editAssessment(row),
      customClassFunction: (row: any) => {
        return row.isLinkGenerated
          ? 'bg-gray-500 py-2 px-4 text-gray-800 rounded-md  cursor-not-allowed'
          : 'bg-custom-blue hover:opacity-80 transition-opacity text-white py-2 px-4 text-white rounded-md';
      },
      disableFunction: (row: any) => this.isEditDisabled(row),
    },
    {
      label: '',
      icon:'fa fa-trash px-2 text-lg',
      title:"Delete",
      colorClass: 'bg-red-500 hover:opacity-80 transition-opacity text-white rounded-md px-4 py-1',
      action: (row: any) => this.confirmDelete(row),
      customClassFunction: (row: any) => {
        return row.isLinkGenerated
          ? 'bg-gray-500 py-2 px-4 text-gray-800 rounded-md  cursor-not-allowed'
          : 'bg-red-500 hover:opacity-80 transition-opacity text-white py-2 px-4 text-white rounded-md';
      },
      disableFunction: (row: any) => this.isEditDisabled(row),
    },
  ];

  // Disable the button if the row has isLinkGenerated set to true
  isEditDisabled(row: any): boolean {
    return row.isLinkGenerated;
  }

  constructor(
    private fireBaseService: FireBaseService<Assessment>,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private asessmentService: AssessmentService
  ) {}

  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
  // getting all assessments
  getAssessments() {
    this.fireBaseService
      .getAllDataByFilter(this.tableName, 'isDisabled', false)
      .subscribe((res: Assessment[]) => {
        // Initially filter out assessments with isDisabled = false
        // Sort the assessments by dateCreated in descending order (newest first)
        this.assessments = res;
        // Trigger change detection manually if needed
        this.cdr.detectChanges();
      });
  }
  // Confirm the deletion of an assessment
  confirmDelete(assessment: Assessment) {
    this.selectedAssessmentToDelete = assessment;
    this.eConfirmationVisible = true;
  }
  deleteAssessment() {
    if (this.selectedAssessmentToDelete) {
      const assessmentToDelete = { ...this.selectedAssessmentToDelete }; // Create a copy of the selected assessment to delete
      assessmentToDelete.isDisabled = true; // Mark the assessment as disabled (soft delete)
  
      // Update the assessment in the Firestore or your database to set isDisabled as true
      this.fireBaseService
        .update(`${this.tableName}/${assessmentToDelete.assessmentId}`, assessmentToDelete)
        .then(() => {
          // Show success toast if the assessment is marked as disabled
          this.toastr.error('Assessment deleted successfully', 'Deleted', { timeOut: 1000 });
          this.getAssessments(); // Refresh the assessments list to reflect the change
          this.eConfirmationVisible = false; // Close the delete confirmation modal
        })
        .catch((error) => {
          // Handle errors if the update fails
          console.error('Error disabling assessment:', error);
          this.toastr.error('Failed to delete assessment', 'Error', { timeOut: 1000 });
        });
    }
  }
  
  viewAssessment(row: any) {
    this.selectedAssessment = { ...row };
    this.isEditMode = false;
    this.isModalVisible = true;

    // Fetch related assessments from 'AssessmentList' where 'assessmentId' matches
    this.fireBaseService
      .getAllDataByFilter(this.assessmentListTable, 'isDisabled', false)
      .subscribe((assessmentList: AssessmentList[]) => {
        // Filter the subjects based on the assessmentId
        const relatedAssessment = assessmentList.filter(
          (result) => result.assessmentId == row.assessmentId
        );
        console.log(relatedAssessment);
      });
  }
  closeModal(): void {
    this.isModalVisible = false; // For the Assessment Details modal
    this.eConfirmationVisible = false; // For the Delete Confirmation modal
  }
  // Edit the selected assessment
  editAssessment(row: Assessment) {
    if (row.assessmentId) {
      this.asessmentService.setAsssessmentId(row.assessmentId); // Store subjectId in service
      this.router.navigate(['/manage-assessment']); // Navigate to /questions route
    } else {
      console.error('Subject ID is missing.');
    }
  }

  // Update the selected assessment
  updateAssessment() {
    if (this.selectedAssessment) {
      this.selectedAssessment.dateUpdated = Date.now();
      this.fireBaseService
        .update(
          `${this.tableName}/${this.selectedAssessment.assessmentId}`,
          this.selectedAssessment
        )
        .then(() => {
          this.toastr.info('Updated!', 'Assessment Updated', { timeOut: 1000 });
          this.isModalVisible = false;
          this.getAssessments(); // Refresh the assessments list after update
        })
        .catch((error) => {
          console.error('Error updating assessment:', error);
        });
    }
  }

  // Handle tab change
}
