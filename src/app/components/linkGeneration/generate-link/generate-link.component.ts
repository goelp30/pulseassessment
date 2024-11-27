import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import assessmentData from '../../../assets/assessment_mockData.json';
// import { ModalComponent } from '../modal/modal.component';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ButtonComponent } from "../../common/button/button.component";
import { ModalComponent } from '../link-generation-modal/modal.component';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [FormsModule, SearchbarComponent, PopupModuleComponent, ButtonComponent, ModalComponent],
  templateUrl: './generate-link.component.html',
  styleUrls: ['./generate-link.component.css'],
})
export class GenerateLinkComponent implements OnInit {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  selectedLink: string = '';
  isModalVisible: boolean = false;
  assessmentType: 'internal' | 'external' = 'external';

  ngOnInit(): void {
    this.assessments = assessmentData;
    this.filteredAssessments = [...this.assessments];
  }

  filterAssessments(query: string): void {
    this.filteredAssessments = this.assessments.filter((assessment) =>
      assessment.assessmentText.toLowerCase().includes(query.toLowerCase())
    );
  }

  generateLink(id: number): string {
    return `https://example.com/assessments/${id}`;
  }

  openModal(link: string, type: 'internal' | 'external'): void {
    this.selectedLink = link;
    this.assessmentType = type;
    this.isModalVisible = true;
    console.log(this.selectedLink)
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onSearchQueryChange(query: string): void {
    this.filterAssessments(query);
  }

  trackAssessment(index: number, assessment: any): number {
    return assessment.assessmentId;
  } 
}
