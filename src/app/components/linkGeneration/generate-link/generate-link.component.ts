import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ModalComponent } from '../link-generation-modal/modal.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';

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
export class GenerateLinkComponent implements OnInit {
  assessments: Assessment[] = []; // Original list of assessments
  filteredAssessments: Assessment[] = []; // Displayed list after filtering
  selectedLink: string = ''; // Link for the modal
  isModalVisible: boolean = false; // Modal visibility toggle
  assessmentType: 'internal' | 'external' = 'external'; // Default filter type

  constructor(private firebaseService: FireBaseService<Assessment>) {}

  ngOnInit(): void {
    this.getAssessments(); // Fetch assessments on initialization
  }

  getAssessments(): void {
    this.firebaseService.getAllData('assessment').subscribe(
      (data) => {
        this.assessments = data;
        console.log(this.assessments); 
        this.filteredAssessments = [...data]; // Initialize filtered list
      },
      (error) => console.error('Error fetching assessments:', error)
    );
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
  generateLink(id: string):any {
    console.log(this.assessmentType)
    return `https://example.com/${id}`;
  }

  // Open the modal with the selected link and type
  openModal(link: string, type: 'internal' | 'external'): void {
    this.selectedLink = link;
    this.assessmentType = type;
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
}
