import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import employeesData from '../../../assets/employees.json';  
import candidatesData from '../../../assets/candidates.json'; 
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { ButtonComponent } from "../../common/button/button.component";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() link: string = '';
  @Input() isVisible: boolean = false;
  @Input() assessmentType: 'internal' | 'external' = 'external'; // Assessment type to determine data source
  @Output() closeModalEvent = new EventEmitter<void>();

  employees: any[] = [];   
  candidates: any[] = [];  
  filteredNames: any[] = [];  
  selectedNames: any[] = [];  
  searchQuery: string = '';   
  selectAll: boolean = false;  
  expiryDate: string = ''; 

  ngOnInit(): void {
    // Initially load data based on the assessmentType
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessmentType']) {
      this.loadData();
    }

    if (changes['searchQuery']) {
      this.filterNames();  // Reapply filtering when the search query changes
    }
  }

  // Loading data based on the assessment type
  loadData(): void {
    if (this.assessmentType === 'internal') {
      this.employees = employeesData;  
      this.filteredNames = [...this.employees]; 
    } else {
      this.candidates = candidatesData;  
      this.filteredNames = [...this.candidates];  
    }

    // Reapplying the search filter after loading data
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

    // After filtering names, check if "Select All" should be checked
    this.updateSelectAllState();
  }

  // Handle individual name selection
  toggleSelection(name: any): void {
    const index = this.selectedNames.indexOf(name);

    if (index === -1) {
      // If the name is not selected, add it to the list
      this.selectedNames.push(name);
    } else {
      // If the name is already selected, remove it
      this.selectedNames.splice(index, 1);
    }

    // After individual selection, check if "Select All" should be checked
    this.updateSelectAllState();
  }

  // Select or Deselect all names
  toggleSelectAll(): void {
    if (this.selectAll) {
      // If "Select All" is checked, select all names in filteredNames
      this.selectedNames = [...this.filteredNames];

      // Also update the 'selected' property for all filteredNames to true
      this.filteredNames.forEach(name => {
        name.selected = true; 
      });
    } else {
      // If "Select All" is unchecked, clear selectedNames
      this.selectedNames = [];

      // Also update the 'selected' property for all filteredNames to false
      this.filteredNames.forEach(name => {
        name.selected = false;  
      });
    }
  }

  // Check if "Select All" should be checked or unchecked based on individual selections
  updateSelectAllState(): void {
    this.selectAll = this.selectedNames.length === this.filteredNames.length;
  }

  closeModal(): void {
  this.resetSelectionData();
  // Emit the event to close the modal
  this.closeModalEvent.emit();
}


  // Handle search query change from the search barr
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterNames();  
  }

  // Remove a selected name
  removeSelectedName(name: any): void {
    const index = this.selectedNames.indexOf(name);
    if (index !== -1) {
      this.selectedNames.splice(index, 1);
    }

    // After removing a name, update "Select All" state
    this.updateSelectAllState();
  }

  // Handle expiry date change
  onExpiryDateChange(event: any): void {
    this.expiryDate = event.target.value;
  }

  onSend(): void {
    // Log the data being sent (optional)
    console.log('Sending data:', {
      selectedNames: this.selectedNames,
      expiryDate: this.expiryDate,
      link: this.link
    });
  
    // Reset the selection-related data after sending
    this.resetSelectionData();
  
    // Optionally, close the modal after sending
    this.closeModal();
  }
  
  // Helper function to reset the selection data (only selections, not names or other data)
  resetSelectionData(): void {
    // Reset selected names and related states
    this.selectedNames = [];  // Clear the selected names
    this.selectAll = false;   // Uncheck "Select All"
    this.filteredNames.forEach(name => name.selected = false); // Deselect all filtered names
    
    // Optionally clear expiry date or other related fields if needed
    this.expiryDate = '';    
  }  
  
  
}
