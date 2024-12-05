import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ModalComponent } from '../link-generation-modal/modal.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [
    FormsModule,
    SearchbarComponent,
    PopupModuleComponent,
    ModalComponent,
  ],
  templateUrl: './generate-link.component.html',
  styleUrls: ['./generate-link.component.css'],
})
export class GenerateLinkComponent implements OnInit, OnDestroy {
  assessments: Assessment[] = []; // Original list of assessments
  filteredAssessments: Assessment[] = []; // Displayed list after filtering
  selectedLink: string = ''; // Link for the modal
  isModalVisible: boolean = false; // Modal visibility toggle
  assessmentType: 'internal' | 'external' = 'external'; // Default filter type
  @Input() successMessage: string = '';

  constructor(
    private firebaseService: FireBaseService<Assessment>,
    private router: Router
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
          console.log(this.assessments);
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
    console.log(this.assessmentType);
    return `https://example.com/${id}`;
  }

  navigateToAssessment(assessmentName: string): void {
    const formattedName = encodeURIComponent(
      assessmentName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    );
    this.router.navigate([`/generatelink`, formattedName]);
  }

  // Open the modal with the selected link and type
  openModal(
    link: string,
    type: 'internal' | 'external',
    assessmentName: string
  ): void {
    this.selectedLink = link;
    this.assessmentType = type;
    this.isModalVisible = true;
    this.navigateToAssessment(assessmentName);
  }

  // Close the modal and reset visibility
  closeModal(): void {
    this.isModalVisible = false;
    this.navigateToAssessment('');
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