import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import assessmentData from '../../assets/assessment_mockData.json';
import { ModalComponent } from '../modal/modal.component';
import { SearchbarComponent } from '../common/searchbar/searchbar.component';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [FormsModule, ModalComponent, SearchbarComponent],
  templateUrl: './generate-link.component.html',
  styleUrls: ['./generate-link.component.css'],
})
export class GenerateLinkComponent implements OnInit {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  selectedLink: string = '';
  isModalVisible: boolean = false;
  assessmentType: 'internal' | 'external' = 'external'; // Default to external

  ngOnInit(): void {
    this.assessments = assessmentData;
    this.filteredAssessments = [...this.assessments];
  }

  // Method to filter assessments based on the search query
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
    this.assessmentType = type; // Set the assessment type
    this.isModalVisible = true; // Show the modal
  }

  closeModal(): void {
    this.isModalVisible = false; // Hide the modal
  }

  // Handle search query change from SearchBarComponent
  onSearchQueryChange(query: string): void {
    this.filterAssessments(query);
  }
}
