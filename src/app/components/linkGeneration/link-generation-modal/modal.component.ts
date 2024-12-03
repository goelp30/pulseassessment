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
