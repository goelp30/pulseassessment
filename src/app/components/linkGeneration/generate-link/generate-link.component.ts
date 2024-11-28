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
  filteredAssessments: any[] = [];
  selectedLink: string = '';
  isModalVisible: boolean = false;
  assessmentType: 'internal' | 'external' = 'external';
  constructor(private firebaseService: FireBaseService<Assessment>) {} // Inject Firebase service
  ngOnInit(): void {
    this.getAssessments(); // Fetch assessments from Firebase on init
  }
  // Fetch data from Firebase
  getAssessments(): void {
    this.firebaseService.getAllData('assessment').subscribe(
      (data) => {
        this.filteredAssessments = data;
      },
      (error) => {
        console.error('Error fetching assessments:', error);
      }
    );
  }

  filterAssessments(query: string): void {
    this.filteredAssessments.filter(
      (assessment) =>
        assessment.assessmentName.toLowerCase().includes(query.toLowerCase()) // Use assessmentName field
    );
  }

  generateLink(id: string): string {
    // Update to use string ID
    return `https://example.com/assessment/${id}`;
  }

  openModal(link: string, type: 'internal' | 'external'): void {
    this.selectedLink = link;
    this.assessmentType = type;
    this.isModalVisible = true;
    // console.log(this.selectedLink);
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onSearchQueryChange(query: string): void {
    this.filterAssessments(query);
  }

  trackAssessment(index: number, assessment: any): string {
    return assessment.assessmentId; // Use unique assessment ID as track key
  }
}
