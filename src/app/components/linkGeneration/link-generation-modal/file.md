import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { ButtonComponent } from '../../common/button/button.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Candidate } from '../../../models/candidate';
import { Employee } from '../../../models/employee';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnChanges {
  // Inputs passed from the parent component
  @Input() link: string = ''; // Link associated with the modal
  @Input() isVisible: boolean = false; // Controls modal visibility
  @Input() assessmentType: 'internal' | 'external' = 'external'; // Assessment type filter
  
  // Output event to notify parent when the modal is closed
  @Output() closeModalEvent = new EventEmitter<void>();

  // Data arrays for employees and candidate
  employees: Employee[] = [];
  candidates: Candidate[] = [];
  filteredNames: any[] = []; // Filtered list displayed in the modal
  selectedNames: any[] = []; // List of selected names
  
  searchQuery: string = ''; // Search input field value
  selectAll: boolean = false; // Toggle for 'Select All' checkbox
  
  expiryDate: string = ''; // Expiry date input field
  expiryTime: string = ''; // Expiry time input field
  isSending: boolean = false; // Indicates if data is being sent
  sendMessage: string = ''; // Message shown after data is sent successfully

  constructor(private firebaseService: FireBaseService<Candidate | Employee>) {}

  ngOnInit(): void {
    // Fetch candidates data from Firebase on component load
    this.firebaseService.getAllData('candidates').subscribe(
      (data: Candidate[]) => (this.candidates = data),
      (error) => console.error('Error fetching candidates:', error)
    );

    // Fetch employees data from Firebase on component load
    this.firebaseService.getAllData('employees').subscribe(
      (data: Employee[]) => (this.employees = data),
      (error) => console.error('Error fetching employees:', error)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset selection data when the modal is hidden
    if (changes['isVisible'] && !changes['isVisible'].currentValue) {
      this.resetSelectionData();
    }
    // Reload data when the assessment type changes
    if (changes['assessmentType']) {
      this.loadData();
    }
    // Re-filter names when the search query changes
    if (changes['searchQuery']) {
      this.filterNames();
    }
  }

  // Load data based on the selected assessment type
  loadData(): void {
    this.filteredNames = this.assessmentType === 'internal' ? [...this.employees] : [...this.candidates];
    this.selectAll = false;
    this.filterNames();
  }

  // Filter names based on the search query
  filterNames(): void {
    this.filteredNames = this.assessmentType === 'external'
      ? this.candidates.filter((item) =>
          item.candidateName.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : this.employees.filter((item) =>
          item.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase()));
    this.updateSelectAllState();
  }

  // Toggle selection of a specific name
  toggleSelection(name: any): void {
    const index = this.selectedNames.indexOf(name);
    index === -1 ? this.selectedNames.push(name) : this.selectedNames.splice(index, 1);
    this.updateSelectAllState();
  }

  // Toggle 'Select All' functionality
  toggleSelectAll(): void {
    this.selectAll ? (this.selectedNames = [...this.filteredNames]) : (this.selectedNames = []);
    this.filteredNames.forEach((name) => (name.selected = this.selectAll));
  }

  // Update the 'Select All' checkbox state based on current selections
  updateSelectAllState(): void {
    this.selectAll = this.filteredNames.length > 0 && this.selectedNames.length === this.filteredNames.length;
  }

  // Close the modal and emit the event to notify the parent
  closeModal(): void {
    this.resetSelectionData();
    this.searchQuery = '';
    this.closeModalEvent.emit();
  }

  // Update search query and filter results accordingly
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterNames();
  }

  // Remove a specific name from the selected list
  removeSelectedName(name: any): void {
    const index = this.selectedNames.indexOf(name);
    if (index !== -1) this.selectedNames.splice(index, 1);
    const personIndex = this.filteredNames.findIndex((person) => person.id === name.id);
    if (personIndex !== -1) this.filteredNames[personIndex].selected = false;
    this.updateSelectAllState();
  }

  // Simulate sending data with a delay and show a success message
  onSend(): void {
    if (this.isSending) return;

    this.isSending = true;
    setTimeout(() => {
      this.sendMessage = 'Data has been sent successfully!';
      setTimeout(() => (this.sendMessage = ''), 2000);
      this.resetSelectionData();
      this.isSending = false;
      this.closeModal();
    }, 3000);
  }

  // Reset selection and input data
  resetSelectionData(): void {
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDate = '';
    this.expiryTime = '';
  }

  // Track items efficiently for rendering optimization
  trackById(item: any): any {
    return item.id;
  }

  // Placeholder for expiry date change handler
  onExpiryDateChange(event: any): void {
    // Logic to handle expiry date change can be implemented here
  }

  // Placeholder for expiry time change handler
  onExpiryTimeChange(event: any): void {
    // Logic to handle expiry time change can be implemented here
  }
}





<app-searchbar
  [placeholder]="'Search names...'"
  (searchQueryChange)="onSearchQueryChange($event)"
  [class]="
    'block w-full px-4 py-2 mb-4 mt-1 border border-gray-300 rounded-full text-lg shadow-md outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all duration-100 transform '
  "
>
</app-searchbar>

<div class="flex justify-between items-center my-2">
  @if (filteredNames.length > 0) {
  <div class="flex items-center">
    <input
      type="checkbox"
      id="selectAll"
      [(ngModel)]="selectAll"
      (change)="toggleSelectAll()"
      class="mr-2 text-blue-600"
    />
    <label for="selectAll" class="text-xs font-medium text-gray-700">
      Select All
    </label>
  </div>
  }
  <div class="text-xs text-gray-500">({{ filteredNames.length }} items)</div>
</div>

<!-- People Data -->
<div
  class="h-40 overflow-auto mb-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
>
  <!-- Check if filteredNames is empty -->
  @if (filteredNames.length === 0) {
  <p class="text-center text-gray-500 font-medium">User not found</p>
  } @else {
  <ul class="space-y-1">
    <!-- Display filtered names here -->
    @for (person of filteredNames; track person.employeeId ||
    person.candidateId) {
    <li>
      <div class="flex items-center">
        <input
          type="checkbox"
          id="person-{{ person.id }}"
          [(ngModel)]="person.selected"
          (change)="toggleSelection(person)"
          class="mr-2 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <label for="person-{{ person.id }}" class="text-xs text-gray-800">
          {{ person.employeeName || person.candidateName }}
        </label>
      </div>
    </li>
    }
  </ul>
  }
</div>

<!-- Display selected names -->
<div
  class="h-40 overflow-auto mb-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
>
  <p class="text-sm font-semibold mb-2 text-gray-800">
    Selected {{ assessmentType === "internal" ? "Employees" : "Candidates" }}
  </p>
  <div class="flex flex-wrap gap-2">
    <!-- Check if selectedNames is empty -->
    @if (selectedNames.length === 0) {
    <p class="text-center text-gray-500 font-medium">
      No {{ assessmentType === "internal" ? "Employee" : "Candidate" }} selected
    </p>
    } @else {
    <!-- Display selected names here -->
    @for (name of selectedNames; track $index) {
    <div class="flex items-center bg-indigo-100 px-2 py-1 rounded-md">
      <span class="text-xs font-medium text-gray-800">{{
        name.employeeName || name.candidateName
      }}</span>
      <button
        type="button"
        (click)="removeSelectedName(name)"
        class="ml-1 text-red-500 font-bold hover:text-red-700 focus:outline-none transition-all duration-200 ease-in-out"
      >
        &times;
      </button>
    </div>
    } }
  </div>
</div>

<div class="flex justify-between items-center space-x-4">
  <div class="flex justify-start items-center space-x-2">
    <!-- Date field -->
    <div class="flex flex-col items-center">
      <input
        type="date"
        id="expiryDate"
        [(ngModel)]="expiryDate"
        (change)="onExpiryDateChange($event)"
        class="bg-transparent text-center border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 py-2 px-2"
      />
    </div>

    <!-- Time field -->
    <div class="flex flex-col items-center">
      <input
        type="time"
        id="expiryTime"
        [(ngModel)]="expiryTime"
        (change)="onExpiryTimeChange($event)"
        class="bg-transparent text-center border-2 border-gray-300 focus:outline-none py-2 px-2"
      />
    </div>
  </div>
  <!-- Send button -->
  <app-button
    [label]="isSending ? 'Sending...' : 'Send'"
    [colorClass]="
      'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-all duration-200 ease-in-out'
    "
    (click)="onSend()"
  ></app-button>
</div>

<div class="flex flex-col justify-center mt-4">
  <!-- Display success message with fade-in transition -->
  @if (sendMessage) {
  <h3
    class="text-center text-green-500 font-medium transition-opacity duration-500 ease-in-out opacity-0"
    [ngClass]="{ 'opacity-100': sendMessage }"
  >
    {{ sendMessage }}
  </h3>
  }
</div>
