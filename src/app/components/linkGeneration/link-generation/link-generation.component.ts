import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ModalComponent } from '../link-generation-modal/modal.component';
import { Assessment } from '../../../models/assessment';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [
    FormsModule,
    SearchbarComponent,
    PopupModuleComponent,
    ModalComponent,
  ],
   templateUrl: './link-generation.component.html',
  styleUrl: './link-generation.component.css'
})
export class LinkGenerationComponent implements OnInit, OnDestroy {
  assessments: Assessment[] = []; // Original list of assessments
  assessmentId: string = '';
  assessmentName: string = '';
  assessmentType: 'internal' | 'external' = 'external'; // Default filter type

  filteredAssessments: Assessment[] = []; // Displayed list after filtering
  selectedLink: string = ''; // Link for the modal
  isModalVisible: boolean = false; // Modal visibility toggle
  @Input() successMessage: string = '';

  constructor(
    private firebaseService: FireBaseService<Assessment>,
  ) {}

  private subscription: Subscription = new Subscription(); // Initialize the subscription

  ngOnInit(): void {
    this.getAssessments(); // Fetch assessments on initialization
  }

  getAssessments(): void {
    const assessmentSub = this.firebaseService
      .getAllData('assessment')
      .subscribe(
        (data) => {
          this.assessments = data;
          // console.log(this.assessments);
          this.filteredAssessments = [...data]; // Initialize filtered list
        },
        (error) => console.error('Error fetching assessments:', error)
      );
    this.subscription.add(assessmentSub); // Add to subscription
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Unsubscribe from all subscriptions
  }
  // Filter assessments based on the search query
  filterAssessments(query: string): void {
    this.filteredAssessments = this.assessments.filter((assessment) =>
      assessment.assessmentName?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Handle search input changes and reset filter if empty
  onSearchQueryChange(query: string): void {
    this.filteredAssessments = query
      ? this.assessments.filter((assessment) =>
          assessment.assessmentName.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.assessments];
  }

  // Generate a link based on the assessment ID
  generateLink(id: string): any {
    // this.assessmentId = id;
    return `https://example.com/${id}`;
  }

  // Open the modal with the selected link and type
  openModal(
    link: string,
    type: 'internal' | 'external',
    assessmentName: string,
    assessmentId: string
  ): void {
    this.selectedLink = link;
    this.assessmentType = type;
    this.assessmentName = assessmentName;
    this.assessmentId = assessmentId;
    this.isModalVisible = true;
  }

  // Close the modal and reset visibility
  closeModal(): void {
    this.isModalVisible = false;
  }

  // Efficiently track assessments in lists for rendering optimization
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
