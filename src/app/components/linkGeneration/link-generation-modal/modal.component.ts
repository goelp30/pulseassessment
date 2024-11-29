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
import employeesData from '../../../assets/employees.json';
import candidatesData from '../../../assets/candidates.json';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { ButtonComponent } from '../../common/button/button.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Candidate } from '../../../models/candidate';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
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
  expiryDate: string = '';
  expiryTime: string = '';

  // Flag to control whether the Send button is disabled or not
  isSending: boolean = false;
  // Message to show after data is sent
  sendMessage: string = '';
  constructor(private firebaseService: FireBaseService<Candidate>) {}

  // createCandidate(): void {
  //   const newCandidate: Candidate = {
  //     candidateId: Date.now().toString(), 
  //     candidateName: 'Sanjay',          
  //     candidateEmail: 'bhuppi@example.com',
  //     candidateContact: this.generatePhoneNumber(), 
  //   };
  
  //   this.firebaseService.create('candidates/' + newCandidate.candidateId, newCandidate)
  //     .then(() => console.log('Candidate added successfully!'))
  //     .catch((error) => console.error('Error adding candidate:', error));
  // }
  
  // // Helper function to generate a random 10-digit phone number
  // generatePhoneNumber(): string {
  //   const prefix = '+91'; 
  //   const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); 
  //   return prefix + randomNumber.toString(); 
  // }
  

  ngOnInit(): void {
    this.loadData();
    // this.createCandidate();
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

  filterNames(): void {
    // Filter names based on search query
    if (this.assessmentType === 'external') {
      this.filteredNames = this.candidates.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredNames = this.employees.filter((item) =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.updateSelectAllState();
  }

  toggleSelection(name: any): void {
    // Toggle selection of a name from the filtered list
    const index = this.selectedNames.indexOf(name);
    if (index === -1) {
      this.selectedNames.push(name);
    } else {
      this.selectedNames.splice(index, 1);
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

  // updateSelectAllState(): void {
  //   // Update the state of the 'Select All' checkbox
  //   this.selectAll = this.selectedNames.length === this.filteredNames.length;
  // }
  updateSelectAllState(): void {
    this.selectAll = this.filteredNames.length > 0 && this.selectedNames.length === this.filteredNames.length;
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

  onExpiryDateChange(event: any): void {
    // Handle expiry date change
  }

  onExpiryTimeChange(event: any): void {
    // Handle expiry time change
  }

  onSend(): void {
    // Prevent sending data multiple times
    if (this.isSending) {
      return;
    }

    this.isSending = true; // Disable button while sending
    console.log('Sending data:', {
      selectedNames: this.selectedNames,
      expiryDate: this.expiryDate,
      expiryTime: this.expiryTime,
      link: this.link,
    });

    // Simulate a network request by setting a timeout (3 seconds)
    setTimeout(() => {
      this.sendMessage = 'Data has been sent successfully!';
      // Hide the success message after 2 seconds
      setTimeout(() => {
        this.sendMessage = ''; // Clear the message
      }, 2000);

      this.resetSelectionData(); // Reset data
      this.isSending = false; // Re-enable the Send button after 3 seconds
      this.closeModal(); // Close the modal after sending
    }, 3000);
  }

  resetSelectionData(): void {
    // Reset all selection data
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDate = '';
    this.expiryTime = '';
  }
}
