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
  imports: [
    FormsModule,
    PopupModuleComponent,
    ModalComponent,
    TableComponent,
  ],
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
  isLinkGenerated?: boolean;
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
      colorClass:
        'bg-custom-blue py-2 px-4 text-white font-semibold hover:opacity-80 transition-opacity  text-white rounded-md ',
      action: (row: any) => this.openModal(row),
    },
  ];
  constructor(private firebaseService: FireBaseService<Assessment>) {}
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.getAssessments();
  }

  getAssessments(): void {
    const assessmentSub = this.firebaseService
      .getAllDataByFilter('assessment', 'isDisabled', false)
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

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterAssessments(query);
  }

  // Generate a link based on the assessment ID
  generateLink(id: string): string {
    const baseUrl = 'http://127.0.0.1:4200/termsandconditions';
    // const baseUrl = 'http://localhost:4200/termsandconditions';
    return `${baseUrl}/${id}`;
  }

  
  openModal(row: any): void {
    this.selectedLink = this.generateLink(row.assessmentId);
    this.assessmentType = row.assessmentType;
    this.assessmentName = row.assessmentName;
    this.assessmentId = row.assessmentId;
    this.isModalVisible = true;
  }

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
