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


<!-- model -->
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

<div class="flex justify-between items-center space-x-4 mb-12">
  <!-- DateTime field -->
  <input
    type="datetime-local"
    id="expiryDate"
    [(ngModel)]="expiryDateTime"
    class="bg-transparent text-center border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 py-2 px-2"
  />

  <!-- Send button -->
  <app-button
    [label]="isSending ? 'Sending...' : 'Send'"
    [colorClass]="
      'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-all duration-200 ease-in-out'
    "
    (click)="onSend()"
  ></app-button>
</div>
<!-- Display success message with fade-in transition -->
<div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
  @if (sendMessage) {
  <div class="bg-green-500 text-white p-4 rounded-md shadow-md">
    <h3 class="text-center font-medium">
      {{ sendMessage }}
    </h3>
  </div>
  }
</div>
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import employeesData from '../../../assets/employees.json';
import candidatesData from '../../../assets/candidates.json';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { ButtonComponent } from '../../common/button/button.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  providers: [DatePipe],
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() link: string = '';
  @Input() isVisible: boolean = false;
  @Input() assessmentType: 'internal' | 'external' = 'external';
  @Output() closeModalEvent = new EventEmitter<void>();

  employees: any[] = [];
  candidates: any[] = [];
  filteredNames: any[] = [];
  selectedNames: any[] = [];
  searchQuery: string = '';
  selectAll: boolean = false;
  expiryDateTime: string = '';
  formattedDate: string = '';
  isSending: boolean = false;
  sendMessage: string = '';

  constructor(
    private datePipe: DatePipe,
    private firebaseService: FireBaseService<any>
  ) {}


  createQuestions(): void {
    const quizData = {
      angular: {
        easy: {
          ques1: {
            type: 'single',
            text: 'What is Angular primarily used for?',
            options: [
              { text: 'Server-side scripting', correct: false },
              { text: 'Mobile App Development', correct: false },
              { text: 'Web Application Development', correct: true },
              { text: 'Database Management', correct: false },
            ],
            user_input: [],
            max_marks: 1,
            scored: 0,
          },
          ques2: {
            type: 'single',
            text: 'Which directive is used for looping in Angular?',
            options: [
              { text: '*ngIf', correct: false },
              { text: '*ngFor', correct: true },
              { text: '*ngSwitch', correct: false },
              { text: '*ngClass', correct: false },
            ],
            user_input: [],
            max_marks: 1,
            scored: 0,
          },
          ques3: {
            type: 'single',
            text: 'What command initializes a new Angular project?',
            options: [
              { text: 'ng start', correct: false },
              { text: 'ng serve', correct: false },
              { text: 'ng init', correct: false },
              { text: 'ng new', correct: true },
            ],
            user_input: [],
            max_marks: 1,
            scored: 0,
          },
          ques4: {
            type: 'single',
            text: 'Which is the default language used in Angular?',
            options: [
              { text: 'Java', correct: false },
              { text: 'C#', correct: false },
              { text: 'JavaScript', correct: true },
              { text: 'Python', correct: false },
            ],
            user_input: [],
            max_marks: 1,
            scored: 0,
          },
          ques5: {
            type: 'single',
            text: 'Which of these is a core concept in Angular?',
            options: [
              { text: 'Controllers', correct: false },
              { text: 'Directives', correct: true },
              { text: 'Filters', correct: false },
              { text: 'Scaffolding', correct: false },
            ],
            user_input: [],
            max_marks: 1,
            scored: 0,
          },
        },
        medium: {
          ques1: {
            type: 'multi',
            text: 'What are some Angular decorators?',
            options: [
              { text: '@Component', correct: true },
              { text: '@Injectable', correct: true },
              { text: '@NgFor', correct: false },
              { text: '@Directive', correct: true },
            ],
            user_input: [],
            max_marks: 3,
            scored: 0,
          },
          ques2: {
            type: 'single',
            text: 'Which lifecycle hook is invoked after the component’s view is fully initialized?',
            options: [
              { text: 'ngOnInit', correct: false },
              { text: 'ngAfterViewInit', correct: true },
              { text: 'ngOnDestroy', correct: false },
              { text: 'ngDoCheck', correct: false },
            ],
            user_input: [],
            max_marks: 3,
            scored: 0,
          },
          ques3: {
            type: 'multi',
            text: 'Which are valid Angular modules?',
            options: [
              { text: 'FormsModule', correct: true },
              { text: 'HttpClientModule', correct: true },
              { text: 'RoutingModule', correct: false },
              { text: 'BrowserModule', correct: true },
            ],
            user_input: [],
            max_marks: 3,
            scored: 0,
          },
          ques4: {
            type: 'multi',
            text: 'What does AOT stand for in Angular?',
            options: [
              { text: 'Ahead of Time', correct: true },
              { text: 'Angular Object Type', correct: false },
              { text: 'After On Time', correct: false },
              { text: 'Application Optimization Tool', correct: false },
            ],
            user_input: [],
            max_marks: 3,
            scored: 0,
          },
          ques5: {
            type: 'single',
            text: 'Which file defines routes in an Angular project?',
            options: [
              { text: 'app.module.ts', correct: false },
              { text: 'app.component.ts', correct: false },
              { text: 'app-routing.module.ts', correct: true },
              { text: 'main.ts', correct: false },
            ],
            user_input: [],
            max_marks: 3,
            scored: 0,
          },
        },
        hard: {
          ques1: {
            type: 'multi',
            text: 'What are benefits of using Angular CLI?',
            options: [
              { text: 'Scaffolding projects', correct: true },
              { text: 'Creating REST APIs', correct: false },
              { text: 'Automated testing', correct: true },
              { text: 'HTTP handling', correct: false },
            ],
            user_input: [],
            max_marks: 5,
            scored: 0,
          },
          ques2: {
            type: 'single',
            text: 'Which Angular module is required to handle HTTP requests?',
            options: [
              { text: 'FormsModule', correct: false },
              { text: 'HttpClientModule', correct: true },
              { text: 'BrowserModule', correct: false },
              { text: 'RouterModule', correct: false },
            ],
            user_input: [],
            max_marks: 5,
            scored: 0,
          },
          ques3: {
            type: 'single',
            text: 'How does Angular implement lazy loading?',
            options: [
              { text: 'With Service Workers', correct: false },
              { text: 'Using @lazy decorator', correct: false },
              { text: 'Through the loadChildren property', correct: true },
              { text: 'Using the ngModule keyword', correct: false },
            ],
            user_input: [],
            max_marks: 5,
            scored: 0,
          },
          ques4: {
            type: 'multi',
            text: 'What are the differences between NgZone and Zone.js?',
            options: [
              { text: 'NgZone controls change detection', correct: true },
              { text: 'Zone.js patches async operations', correct: true },
              { text: 'NgZone is for templates only', correct: false },
              { text: 'Zone.js is part of Angular', correct: false },
            ],
            user_input: [],
            max_marks: 5,
            scored: 0,
          },
          ques5: {
            type: 'multi',
            text: 'Which RxJS operators combine observables?',
            options: [
              { text: 'mergeMap', correct: false },
              { text: 'switchMap', correct: false },
              { text: 'combineLatest', correct: true },
              { text: 'concatMap', correct: false },
            ],
            user_input: [],
            max_marks: 5,
            scored: 0,
          },
        },
        descriptive: {
          ques1: {
            text: 'Explain Angular Dependency Injection and its benefits.',
            users_answer: '',
            max_marks: 10,
            scored: 0,
          },
          ques2: {
            text: 'Describe the Angular Lifecycle Hooks and their use cases.',
            users_answer: '',
            max_marks: 10,
            scored: 0,
          },
        },
      },
    };
  
    this.firebaseService
      .create('questions/', quizData)
      .then(() => {
        console.log('Quiz data added successfully!');
      })
      .catch((error) => {
        console.error('Error adding quiz data:', error);
      });
  }

  ngOnInit(): void {
    this.loadData();
    // this.createQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && !changes['isVisible'].currentValue) {
      this.resetSelectionData(); // Reset only when modal is closing
    }
    if (changes['assessmentType']) {
      this.loadData();
    }

    if (changes['searchQuery']) {
      this.filterNames();
    }
  }

  loadData(): void {
    // Load either employees or candidates based on assessment type
    if (this.assessmentType === 'internal') {
      this.employees = employeesData;
      this.filteredNames = this.employees;
    } else {
      this.candidates = candidatesData;
      this.filteredNames = this.candidates;
    }
    this.filterNames();
  }

  trackById(index: number, person: any): string | number {
    const id = person.employeeId || person.candidateId || index;
    console.log(`Index: ${index}, ID: ${id}`);
    return id;
  }

  filterNames(): void {
    // Filter names based on search query
    if (this.assessmentType === 'external') {
      this.filteredNames = this.candidates.filter((item) =>
        item.candidateName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredNames = this.employees.filter((item) =>
        item.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.updateSelectAllState();
  }

  toggleSelection(name: any): void {
    // Toggle selection of a name from the filtered list
    const index = this.selectedNames.indexOf(name);
    if (index === -1) {
      this.selectedNames.push(name);
      console.log(this.selectedNames);
    } else {
      this.selectedNames.splice(index, 1);
    }
    this.updateSelectAllState();
  }

  removeSelectedName(name: any): void {
    // Remove a selected name from the list
    const index = this.selectedNames.indexOf(name);
    if (index !== -1) {
      this.selectedNames.splice(index, 1);
    }
    const personIndex = this.filteredNames.findIndex(
      (person) => person.id === name.id
    );
    if (personIndex !== -1) {
      this.filteredNames[personIndex].selected = false;
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    // Select or deselect all names in the filtered list
    if (this.selectAll) {
      this.selectedNames = [...this.filteredNames];
      this.filteredNames.forEach((name) => {
        name.selected = true;
      });
    } else {
      this.selectedNames = [];
      this.filteredNames.forEach((name) => {
        name.selected = false;
      });
    }
  }

  updateSelectAllState(): void {
    this.selectAll =
      this.filteredNames.length > 0 &&
      this.selectedNames.length === this.filteredNames.length;
  }
  closeModal(): void {
    // Reset data and close the modal
    this.resetSelectionData();
    this.searchQuery = '';
    this.closeModalEvent.emit();
  }

  onSearchQueryChange(query: string): void {
    // Handle search query change and filter names accordingly
    this.searchQuery = query;
    this.filterNames();
  }

  dateTime(): void {
    if (this.expiryDateTime) {
      const date = new Date(this.expiryDateTime);
      this.formattedDate = this.datePipe.transform(date, 'yyyyMMddHHmmss')!;
      console.log('Formatted Date:', this.formattedDate);
    }
  }

  onSend(): void {
    // Prevent sending data multiple times
    if (this.isSending) {
      return;
    }

    this.dateTime();
    this.isSending = true; // Disable button while sending
    console.log('Sending data:', {
      selectedNames: this.selectedNames,
      expiryDateTime: this.formattedDate,
      link: this.link,
    });

    // Simulate a network request by setting a timeout (3 seconds)
    setTimeout(() => {
      this.sendMessage = 'Data has been sent successfully!';
      // Hide the success message after 2 seconds
      setTimeout(() => {
        this.sendMessage = ''; // Clear the message
      }, 1000);

      this.resetSelectionData(); // Reset data
      this.isSending = false; // Re-enable the Send button after 3 seconds
      this.closeModal(); // Close the modal after sending
    }, 1000);
  }

  resetSelectionData(): void {
    // Reset all selection data
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDateTime = '';
  }
}

