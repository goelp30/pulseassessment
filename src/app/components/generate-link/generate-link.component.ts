import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  imports: [NgFor, FormsModule,],
  templateUrl: './generate-link.component.html',
  styleUrl: './generate-link.component.css'
})
export class GenerateLinkComponent {
  assessments = [
    { id: 1, title: 'JavaScript Basics' },
    { id: 2, title: 'React Components' },
    { id: 3, title: 'Database Design' },
    { id: 4, title: 'Algorithms and Data Structures' },
    { id: 5, title: 'Web Security Principles' }
  ];

  selectedLink: string = '';
  searchQuery: string = '';
  filteredAssessments = [...this.assessments];
  @ViewChild('modalLink') modalLink!: ElementRef;

  filterAssessments(): void {
    this.filteredAssessments = this.assessments.filter(assessment =>
      assessment.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  
  generateLink(id: number): string {
    return `https://example.com/assessments/${id}`;
  }

  openModal(link: string): void {
    this.selectedLink = link;
    const modal = document.getElementById('modalLink');
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
