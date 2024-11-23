import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import employeesData from '../../assets/employees.json';  // Import employee data
import candidatesData from '../../assets/candidates.json'; // Import candidate data
import { SearchbarComponent } from '../common/searchbar/searchbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() link: string = '';
  @Input() isVisible: boolean = false;
  @Input() assessmentType: 'internal' | 'external' = 'external'; // Assessment type to determine data source
  @Output() closeModalEvent = new EventEmitter<void>();

  employees: any[] = [];   // List of employees
  candidates: any[] = [];  // List of candidates
  filteredNames: any[] = [];  // This will store the filtered names based on search
  selectedNames: any[] = [];  // This will store the selected names
  searchQuery: string = '';   // Search query input
  selectAll: boolean = false;  // For "Select All" functionality
  expiryDate: string = '';  // To store expiry date

  ngOnInit(): void {
    // Initially load data based on the assessmentType
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If the assessmentType changes, we need to reload the data
    if (changes['assessmentType']) {
      this.loadData();
    }
  }

  // Load data based on the assessment type
  loadData(): void {
    if (this.assessmentType === 'internal') {
      this.employees = employeesData;  // Load employee data
      this.filteredNames = [...this.employees];  // Show employee names initially
    } else {
      this.candidates = candidatesData;  // Load candidate data
      this.filteredNames = [...this.candidates];  // Show candidate names initially
    }

    // Reapply the search filter after loading data
    this.filterNames();
  }

  // Filter names based on the search query
  filterNames(): void {
    if (this.assessmentType === 'external') {
      this.filteredNames = this.candidates.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredNames = this.employees.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  // Handle individual name selection
  toggleSelection(name: any): void {
    const index = this.selectedNames.indexOf(name);
    if (index === -1) {
      this.selectedNames.push(name);
    } else {
      this.selectedNames.splice(index, 1);
    }
  }

  // Select or Deselect all names
  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedNames = [...this.filteredNames];
    } else {
      this.selectedNames = [];
    }
  }

  // Close the modal
  closeModal(): void {
    this.closeModalEvent.emit();  // Emit event to close modal
  }

  // Handle search query change from the search bar
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterNames();  // Filter names whenever search query changes
  }

  // Remove a selected name
  removeSelectedName(name: any): void {
    const index = this.selectedNames.indexOf(name);
    if (index !== -1) {
      this.selectedNames.splice(index, 1);
    }
  }

  // Handle expiry date change
  onExpiryDateChange(event: any): void {
    this.expiryDate = event.target.value;
  }

  // Handle send button click (you can add logic to handle sending the data here)
  onSend(): void {
    console.log('Sending data:', {
      selectedNames: this.selectedNames,
      expiryDate: this.expiryDate,
      link: this.link
    });
    // Add your sending logic here (e.g., make an API call)
    this.closeModal();  // Close the modal after sending
  }
}
