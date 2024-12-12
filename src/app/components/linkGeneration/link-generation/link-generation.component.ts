import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ModalComponent } from '../link-generation-modal/modal.component';
import { Assessment } from '../../../models/assessment';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [FormsModule, PopupModuleComponent, ModalComponent, TableComponent],
  templateUrl: './link-generation.component.html',
  styleUrl: './link-generation.component.css',
})
export class LinkGenerationComponent implements OnInit, OnDestroy {
  @Input() successMessage: string = '';
  assessments: Assessment[] = [];
  assessmentId: string = '';
  assessmentName: string = '';
  assessmentType: 'internal' | 'external' = 'external';
  filteredAssessments: Assessment[] = [];
  selectedLink: string = '';
  isModalVisible: boolean = false;

  tableName: string = TableNames.Assessment;
  tableColumns: string[] = ['assessmentName', 'assessmentType'];
  columnAliases: { [key: string]: string[] } = {
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type'],
  };
  tableData = this.assessments;
  searchQuery: string = '';
  searchPlaceholder: string = 'Search Assessments...';

  buttons = [
    {
      label: 'Generate Link',
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.openModal(row),
    },
  ];
  constructor(
    private firebaseService: FireBaseService<Assessment>,
  ) {}

  private subscription: Subscription = new Subscription(); 
  ngOnInit(): void {
    this.getAssessments();
  }

  getAssessments(): void {
    const assessmentSub = this.firebaseService
      .getAllData('assessment')
      .subscribe(
        (data) => {
          this.assessments = data;
          this.filteredAssessments = [...data];
        },
        (error) => console.error('Error fetching assessments:', error)
      );
    this.subscription.add(assessmentSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filterAssessments(query: string): void {
    this.filteredAssessments = this.assessments.filter((assessment) =>
      assessment.assessmentName?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Handle search input changes and reset filter if empty
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterAssessments(query);
  }

  // Generate a link based on the assessment ID
  generateLink(id: string): string {
    const baseUrl = 'http://localhost:4200/termsandconditions';
    return `${baseUrl}/${id}`;
  }

  // Open the modal with the selected link and type
  openModal(row: any): void {
    this.selectedLink = this.generateLink(row.assessmentId);
    this.assessmentType = row.assessmentType;
    this.assessmentName = row.assessmentName;
    this.assessmentId = row.assessmentId;
    this.isModalVisible = true;
  }

  // Close the modal and reset visibility
  closeModal(): void {
    this.isModalVisible = false;
  }

  trackAssessment(index: number, assessment: Assessment): string {
    return assessment.assessmentId;
  }
  onSuccessMessageReceived(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }
}
