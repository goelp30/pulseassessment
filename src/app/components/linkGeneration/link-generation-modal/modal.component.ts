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
import { Candidate } from '../../../models/candidate';

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

  constructor(private datePipe: DatePipe) {}

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
    if(this.expiryDateTime){
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
