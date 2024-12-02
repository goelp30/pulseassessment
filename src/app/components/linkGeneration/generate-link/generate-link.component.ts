import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ButtonComponent } from '../../common/button/button.component';
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
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './generate-link.component.html',
  styleUrls: ['./generate-link.component.css'],
})
export class GenerateLinkComponent implements OnInit {
  assessments: Assessment[] = []; // Original list of assessments
  filteredAssessments: Assessment[] = []; // Displayed/filtered list
  selectedLink: string = '';
  isModalVisible: boolean = false;
  assessmentType: 'internal' | 'external' = 'external'; // Default shows all

  constructor(private firebaseService: FireBaseService<Assessment>) {}

  ngOnInit(): void {
    this.getAssessments(); // Fetch assessments on page load
  }

  getAssessments(): void {
    this.firebaseService.getAllData('assessment').subscribe(
      (data) => {
        this.assessments = data;
        this.filteredAssessments = [...data]; // Initialize filtered list with all data
      },
      (error) => {
        console.error('Error fetching assessments:', error);
      }
    );
  }

  // Filter only from displayed assessments
  filterAssessments(query: string): void {
    this.filteredAssessments = this.assessments.filter(
      (assessment) =>
        assessment.assessmentName.toLowerCase().includes(query.toLowerCase())
    );
  }

  onSearchQueryChange(query: string): void {
    if (!query) {
      // If the query is empty, reset to the full list
      this.filteredAssessments = [...this.assessments];
    } else {
      this.filterAssessments(query);
    }
  }

  generateLink(id: string): string {
    return `https://example.com/assessment/${id}`;
  }

  openModal(link: string, type: 'internal' | 'external'): void {
    this.selectedLink = link;
    this.assessmentType = type;
    this.isModalVisible = true;
    console.log(this.assessmentType)
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  trackAssessment(index: number, assessment: Assessment): string {
    return assessment.assessmentId; // Ensure efficient re-rendering
  }
}