import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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

@Component({
  selector: 'app-assess-table',
  standalone: true,
  imports: [TableComponent, PopupModuleComponent, CommonModule, FormsModule, ToastrModule],
  templateUrl: './assess-table.component.html',
  styleUrls: ['./assess-table.component.css']
})
export class AssessTableComponent implements OnInit, AfterViewInit {
  assessments: Assessment[] = [];
  subjects: any[] = []; // Store the related subjects of the selected assessment
  tableColumns: string[] = ['assessmentName', 'assessmentType'];
  columnAliases: { [key: string]: string[] } = {
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type']
  };
  tableName: string = TableNames.Assessment;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isLoading = false;
  selectedAssessment: Assessment = {  // Initialize with a default empty object
    assessmentId: '',
    assessmentName: '',
    assessmentType: 'internal',
    dateCreated: Date.now(),
    dateUpdated: Date.now(),
    isDisabled: false,
    isautoEvaluated: true
  };
  isEditMode: boolean = false;
  eConfirmationVisible: boolean = false;
  selectedAssessmentToDelete: Assessment | null = null;
  searchPlaceholder: string = 'Search Assessments...';

  // For handling tabs
  selectedTab: string = 'all';

  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.editAssessment(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.confirmDelete(row),
    },
    {
      label: 'View',
      colorClass: 'bg-green-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.viewAssessment(row),
    },
  ];

  constructor(
    private auth: AuthService,
    private fireBaseService: FireBaseService<Assessment>,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAssessments(); // Fetch assessments on component initialization
  }

  ngAfterViewInit(): void {
    this.getAssessments();
  }

  logout() {
    this.auth.logout();
  }

  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }

  addAssessment() {
    const uniqueId = crypto.randomUUID();
    const assess: Assessment = {
      assessmentId: uniqueId,
      assessmentName: (Math.random() + 1).toString(36).substring(7),
      assessmentType: 'internal',
      dateCreated: Date.now(),
      dateUpdated: Date.now(),
      isDisabled: false,
      isautoEvaluated: true
    };
    this.fireBaseService.create(TableNames.Assessment + '/' + uniqueId, assess);
  }

  // Get assessments with isDisabled: false (only active assessments)
  getAssessments() {
    this.fireBaseService.getAllData(this.tableName).subscribe((res: Assessment[]) => {
      const activeAssessments = res.filter(assessment => !assessment.isDisabled);
      this.assessments = activeAssessments;
      this.filterAssessmentsByTab();
      this.cdr.detectChanges();
    });
  }

  // Confirm the deletion of an assessment
  confirmDelete(assessment: Assessment) {
    this.selectedAssessmentToDelete = assessment;
    this.eConfirmationVisible = true;
  }

  // Proceed with the deletion of the assessment
  deleteAssessment() {
    if (this.selectedAssessmentToDelete) {
      const assessmentToDelete = this.selectedAssessmentToDelete;
      assessmentToDelete.isDisabled = true; // Mark as deleted (disabled)

      this.fireBaseService.update(`${this.tableName}/${assessmentToDelete.assessmentId}`, assessmentToDelete)
        .then(() => {
          this.toastr.success('Assessment deleted successfully', 'Deleted');
          this.eConfirmationVisible = false;
          this.getAssessments();
        })
        .catch(error => {
          console.error('Error deleting assessment:', error);
          this.toastr.error('Failed to delete assessment', 'Error');
        });
    }
  }

  assessmentListTable=TableNames.AssessmentList;
  // View the details of the assessment and related subjects
// In AssessTableComponent (TypeScript)
viewAssessment(row: any) {
  this.selectedAssessment = { ...row };
  this.isEditMode = false;
  this.isModalVisible = true;

  // Fetch related assessments from 'AssessmentList' where 'assessmentId' matches
  this.fireBaseService.getAllData(this.assessmentListTable).subscribe((assessmentList: AssessmentList[]) => {
    // Filter the subjects based on the assessmentId
    const relatedAssessment = assessmentList.filter(result=>result.assessmentId==row.assessmentId);
    console.log(relatedAssessment);
  })
}

  closeModal(): void {
    this.isModalVisible = false;
  }


  // Edit the selected assessment
  editAssessment(row: any) {
    this.selectedAssessment = { ...row.assessmentId };
    this.isEditMode = true;
    this.isModalVisible = true;
  }

  // Update the selected assessment
  updateAssessment() {
    if (this.selectedAssessment) {
      this.selectedAssessment.dateUpdated = Date.now();
      this.fireBaseService.update(
        `${this.tableName}/${this.selectedAssessment.assessmentId}`,
        this.selectedAssessment
      ).then(() => {
        this.toastr.info('Updated!', 'Assessment Updated', { timeOut: 1000 });
        this.isModalVisible = false;
        this.getAssessments(); // Refresh the assessments list after update
      }).catch(error => {
        console.error('Error updating assessment:', error);
      });
    }
  }

  // Handle tab change
  onTabChange(selectedTab: string) {
    this.selectedTab = selectedTab;
    this.filterAssessmentsByTab();
  }

  filterAssessmentsByTab() {
    if (this.selectedTab === 'internal') {
      this.assessments = this.assessments.filter(a => a.assessmentType === 'internal');
    } else if (this.selectedTab === 'external') {
      this.assessments = this.assessments.filter(a => a.assessmentType === 'external');
    } else {
      this.getAssessments(); 
    }
  }
}
