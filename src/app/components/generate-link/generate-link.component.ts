import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import assessmentData from '../../assets/assessment_mockData.json';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './generate-link.component.html',
  styleUrl: './generate-link.component.css',
})
export class GenerateLinkComponent implements OnInit {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  selectedLink: string = '';
  searchQuery: string = '';
  
  @ViewChild('modalLink') modalLink!: ElementRef;

  ngOnInit(): void {
    this.assessments = assessmentData;
    this.filteredAssessments = [...this.assessments]; 
  }

  filterAssessments(): void {
    this.filteredAssessments = this.assessments.filter((assessment) =>
      assessment.assessmentText.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  generateLink(id: number): string {
    return `https://example.com/assessments/${id}`;
  }

  openModal(link: string): void {
    this.selectedLink = link;
    if (this.modalLink) {
      this.modalLink.nativeElement.style.display = 'block';
    }
  }

  closeModal(): void {
    if (this.modalLink) {
      this.modalLink.nativeElement.style.display = 'none';
    }
  }
}
