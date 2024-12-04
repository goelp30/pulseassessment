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
  providers: [DatePipe],
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() link: string = '';
  @Input() isVisible: boolean = true;
  @Input() assessmentType: 'internal' | 'external' = 'external';
  @Output() closeModalEvent = new EventEmitter<void>();

  employees: Employee[] = [];
  candidates: Candidate[] = [];
  filteredNames: any[] = [];
  selectedNames: any[] = [];
  searchQuery: string = '';
  selectAll: boolean = false;
  expiryDateTime: string = '';
  formattedDate: string = '';
  isSending: boolean = false;
  @Output() successMessageEvent = new EventEmitter<string>();
  sendMessage: string = 'Data has been sent successfully!';

  constructor(
    private firebaseService: FireBaseService<Candidate | Employee>,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Fetch all candidate data from Firebase Realtime Database
    this.firebaseService
      .getAllData('candidates') // 'candidates' is the name of the table in Firebase
      .subscribe(
        (data: Candidate[]) => {
          console.log('Fetched Candidates:', data);
          this.candidates = data; // Store fetched candidates in the candidates array
        },
        (error: any) => {
          console.error('Error fetching candidate data:', error);
        }
      );

    // Fetch all employee data from Firebase Realtime Database
    this.firebaseService
      .getAllData('employees') // 'employee' is the name of the table in Firebase
      .subscribe(
        (data: Employee[]) => {
          console.log('Fetched Employee:', data); // Log the raw data from Firebase
          if (data && data.length > 0) {
            this.employees = data; // Store fetched employee data in the employee array
          } else {
            console.warn('No employee data found');
          }
        },
        (error: any) => {
          console.error('Error fetching employee data:', error);
        }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue) {
      this.loadData(); // Load data again if modal becomes visible
      this.searchQuery = '';
    }
    if (changes['assessmentType']) {
      this.loadData();
    }

    if (changes['searchQuery']) {
      this.filterNames();
    }
  }

  loadData(): void {
    // Clear the filtered names before loading new data
    this.filteredNames = [];

    if (this.assessmentType === 'internal') {
      // Load internal (employee) data from Firebase
      this.firebaseService.getAllData('employees').subscribe(
        (data: Employee[]) => {
          this.employees = data; // Store fetched employee data
          this.filteredNames = [...this.employees]; // Initialize filtered names
          this.filterNames(); // Filter based on the search query
        },
        (error: any) => {
          console.error('Error fetching employee data:', error);
        }
      );
    } else if (this.assessmentType === 'external') {
      // Load external (candidate) data from Firebase
      this.firebaseService.getAllData('candidates').subscribe(
        (data: Candidate[]) => {
          this.candidates = data; // Store fetched candidate data
          this.filteredNames = [...this.candidates]; // Initialize filtered names
          this.filterNames(); // Filter based on the search query
        },
        (error: any) => {
          console.error('Error fetching candidate data:', error);
        }
      );
    }
  }

  filterNames(): void {
    // Filter names based on search query
    if (this.assessmentType === 'external') {
      this.filteredNames = this.candidates.filter((item) =>
        item.candidateName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      );
    } else if (this.assessmentType === 'internal') {
      this.filteredNames = this.employees.filter((item) =>
        item.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    console.log('Filtered Names:', this.filteredNames);
    this.updateSelectAllState();
  }

  // Method to toggle selection of an individual user
  // toggleSelection(name: any): void {
  //   const index = this.selectedNames.indexOf(name);

  //   // If the name is not already selected, add to the selectedNames array
  //   if (index === -1) {
  //     this.selectedNames.push(name);
  //     name.selected = true;
  //   } else {
  //     // If already selected, remove from selectedNames
  //     this.selectedNames.splice(index, 1);
  //   }

  //   // Update the 'selected' state for the corresponding user in filteredNames
  //   const personIndex = this.filteredNames.findIndex(
  //     (person) => person.id === name.id
  //   );
  //   if (personIndex !== -1) {
  //     this.filteredNames[personIndex].selected =
  //       !this.filteredNames[personIndex].selected;
  //   }

  //   // Update the state of 'Select All' checkbox
  //   this.updateSelectAllState();
  // }
  toggleSelection(name: any): void {
    const index = this.selectedNames.findIndex(
      (selected) => selected.id === name.id
    );
  
    if (index === -1) {
      // Add if not already selected
      this.selectedNames.push(name);
      name.selected = true;
    } else {
      // Remove if already selected
      this.selectedNames.splice(index, 1);
      name.selected = false;  // Ensure this state change reflects in the UI
    }
  
    // Update 'filteredNames' to reflect the selection state
    const personIndex = this.filteredNames.findIndex(
      (person) => person.id === name.id
    );
    if (personIndex !== -1) {
      this.filteredNames[personIndex].selected = name.selected;
    }
  
    this.updateSelectAllState();
  }
  
  // Method to handle "Select All" checkbox
  toggleSelectAll(): void {
    // If Select All is checked, select all users in filteredNames
    if (this.selectAll) {
      this.selectedNames = [...this.filteredNames]; // Copy all items from filteredNames
      this.filteredNames.forEach((name) => {
        name.selected = true; // Mark each user as selected
      });
    } else {
      this.selectedNames = []; // Clear the selectedNames array
      this.filteredNames.forEach((name) => {
        name.selected = false; // Mark each user as deselected
      });
    }

    // Update the 'Select All' checkbox state
    this.updateSelectAllState();
  }

  // Method to update the state of the 'Select All' checkbox
  updateSelectAllState(): void {
    // If all users in filteredNames are selected, set selectAll to true
    this.selectAll =
      this.filteredNames.length > 0 &&
      this.selectedNames.length === this.filteredNames.length;
  }

  // Method to remove a selected user when the cross button is clicked
  // removeSelectedName(name: any): void {
  //   // Remove the name from selectedNames array using the unique ID
  //   const index = this.selectedNames.findIndex(
  //     (selected) => selected.id === name.id
  //   );
  //   if (index !== -1) {
  //     this.selectedNames.splice(index, 1); // Remove user from selectedNames
  //     name.select=false
  //   }

  //   // Update the 'selected' state for the corresponding user in filteredNames using the unique ID
  //   const personIndex = this.filteredNames.findIndex(
  //     (person) => person.id === name.id
  //   );
  //   if (personIndex !== -1) {
  //     this.filteredNames[personIndex].selected = false; // Uncheck the user in the list
  //   }

  //   // Update the state of 'Select All' checkbox
  //   this.updateSelectAllState();
  // }

  removeSelectedName(name: any): void {
    // Remove the person by their unique ID
    this.selectedNames = this.selectedNames.filter(
      (selected) => selected.id !== name.id
    );
  
    // Find the corresponding person in filteredNames and uncheck it
    const personIndex = this.filteredNames.findIndex(
      (person) => person.id === name.id
    );
    if (personIndex !== -1) {
      this.filteredNames[personIndex].selected = false;
    }
  
    // Update the 'Select All' checkbox state
    this.updateSelectAllState();
  }
  

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  onSearchQueryChange(query: string): void {
    // Handle search query change and filter names accordingly
    this.searchQuery = query;
    this.filterNames();
  }

  onExpiryTimeChange(event: any): void {
    // Handle expiry time change
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
    setTimeout(() => {
      this.resetSelectionData(); 
      this.closeModalEvent.emit();
      this.successMessageEvent.emit(this.sendMessage);
      this.isSending = false; 
    }, 2000);
  }

  resetSelectionData(): void {
    // Reset all selection data
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDateTime = '';
  }

  trackById(item: any):number {
    return item.id;
  }
}
