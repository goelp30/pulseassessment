import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core'; 
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { ButtonComponent } from '../../common/button/button.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Candidate } from '../../../models/candidate';
import { Employee } from '../../../models/employee';
import { Subscription } from 'rxjs';
import { BitlyService } from '../services/bitly.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SearchbarComponent, FormsModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  providers: [DatePipe],
})
export class ModalComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(SearchbarComponent) searchBar!: SearchbarComponent;
  @Input() link: string = '';
  @Input() isVisible: boolean = true;
  @Input() assessmentType: 'internal' | 'external' = 'external';
  @Input() disabled: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() assessmentId: string = '';
  @Input() assessmentName: string = '';
  @Output() successMessageEvent = new EventEmitter<string>();

  employees: Employee[] = [];
  candidates: Candidate[] = [];
  filteredNames: any[] = [];
  selectedNames: any[] = [];
  searchQuery: string = '';
  selectAll: boolean = false;
  expiryDateTime: string = '';
  expiryDate: string = '';
  isSending: boolean = false;
  minDateTime: string = '';
  sendMessage: string = 'Data has been sent successfully!';

  private subscription: Subscription = new Subscription(); 
  constructor(
    private firebaseService: FireBaseService<any>,
    private datePipe: DatePipe,
    private bitlyService: BitlyService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setMinDateTime();
  }
  setMinDateTime(): void {
    const currentDate = new Date();
    // Extract the local date and time, formatted as 'YYYY-MM-DDTHH:MM'
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    // Construct the minDateTime in local time format
    this.minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  // Event handler when the date or time changes
  onDateTimeChange(event: Event): void {
    const selectedDate = new Date(this.expiryDateTime);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      alert('The selected time is in the past. Please select a valid time.');
      this.expiryDateTime = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue == false) {
      this.resetSearchBar();
      this.resetSelectionData();
      this.loadData(); 
      this.searchQuery = '';
      this.filteredNames = [];
    }
    if (changes['assessmentType']) {
      this.loadData();
    }

    if (changes['searchQuery']) {
      this.filterNames();
    }
  }

  resetSearchBar(): void {
    if (this.searchBar) {
      this.searchBar.searchQuery = ''; 
      this.searchBar.searchQueryChange.emit(''); 
    }
  }
  loadData(): void {
    this.filteredNames = [];
    if (this.assessmentType === 'internal') {
      const emploYeeSub = this.firebaseService
        .getAllData('employees')
        .subscribe(
          (data: Employee[]) => {
            this.employees = data; 
            this.filteredNames = [...this.employees]; 
            this.filterNames(); 
          },
          (error: any) => {
            console.error('Error fetching employee data:', error);
          }
        );
      this.subscription.add(emploYeeSub); 
    } else if (this.assessmentType === 'external') {
      const candidateSub = this.firebaseService
        .getAllData('candidates')
        .subscribe(
          (data: Candidate[]) => {
            this.candidates = data; 
            this.filteredNames = [...this.candidates]; 
            this.filterNames(); 
          },
          (error: any) => {
            console.error('Error fetching candidate data:', error);
          }
        );
      this.subscription.add(candidateSub); 
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe(); 
  }
  filterNames(): void {
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
    this.updateSelectAllState(); 
  }

  toggleSelection(name: any): void {
    const id = name.candidateId || name.employeeId; 
    const index = this.selectedNames.findIndex(
      (selected) => (selected.candidateId || selected.employeeId) === id
    );
    if (index === -1) {
      this.selectedNames.push(name); 
    } else {
      this.selectedNames.splice(index, 1); 
    }
    const personIndex = this.filteredNames.findIndex(
      (person) => (person.candidateId || person.employeeId) === id
    );
    if (personIndex !== -1) {
      this.filteredNames[personIndex].selected =
        !this.filteredNames[personIndex].selected;
    }
    this.updateSelectAllState(); 
  }

  toggleSelectAll(): void {
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
    this.updateSelectAllState();
  }
  
  updateSelectAllState(): void {
    this.selectAll =
      this.filteredNames.length > 0 &&
      this.selectedNames.length === this.filteredNames.length;
  }

  // Method to remove a selected user when the cross button is clicked
  removeSelectedName(name: any): void {
    const id = name.candidateId || name.employeeId;
    const index = this.selectedNames.findIndex(
      (selected) => (selected.candidateId || selected.employeeId) === id
    );
    if (index !== -1) {
      this.selectedNames.splice(index, 1); 
    }
    const personIndex = this.filteredNames.findIndex(
      (person) => (person.candidateId || person.employeeId) === id
    );
    if (personIndex !== -1) {
      this.filteredNames[personIndex].selected = false; 
    }
    this.updateSelectAllState(); 
  }
  closeModal(): void {
    this.resetSelectionData();
    this.searchQuery = ''; 
    this.filteredNames = []; 
    this.selectAll = false; 
    this.selectedNames = []; 
    this.closeModalEvent.emit();
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterNames();
  }
  onExpiryTimeChange(event: any): void {
  }
  dateTime(): void {
    if (this.expiryDateTime) {
      const date = new Date(this.expiryDateTime);
      this.expiryDate = date.toISOString();
    }
  }
  onSend(): void {
    if (this.isSending) {
      return; 
    }
    this.dateTime();
    this.isSending = true;
    this.selectedNames.forEach((user) => {
      const userLink = this.buildUrlWithUserId(this.link, user);
      // this.bitlyService.shortenLink(userLink).subscribe(
        // (response) => {
          // const shortenedUrl = response.link; 
          const recordKey = `${this.assessmentId}_${user.candidateId || user.employeeId}`;
          const record = {
            assessmentId: this.assessmentId,
            // url: shortenedUrl,
            url: userLink,
            email: user.employeeEmail || user.candidateEmail,
            userId: user.candidateId || user.employeeId || null,
            userName: user.candidateName || user.employeeName,
            assessmentName: this.assessmentName,
            assessmentType: this.assessmentType,
            expiryDate: this.expiryDate,
            isActive: true,
            inProgress: false,
            isCompleted: false,
            isValid: true,
            isAccessed: false,
          };
          
          this.firebaseService.create(`/assessmentRecords/${recordKey}`, record)
            .then(() => {
              console.log('Record saved successfully');
            })
            .catch((error) => {
              console.error('Error saving record:', error);
            });
        // },
        // (error) => {
        //   console.error('Error shortening link:', error);
        //   if (error.error) {
        //     console.error('Error details:', error.error);  
        //   }
        //   this.isSending = false;
        // }
      // );
    });
  
    setTimeout(() => {
      this.resetSelectionData();
      this.closeModalEvent.emit();
      this.successMessageEvent.emit(this.sendMessage);
      this.isSending = false;
    }, 2000);
  }
  
  isSendButtonEnabled(): boolean {
    return this.selectedNames.length > 0 && this.expiryDateTime !== '';
  }

  // Helper function to build URL for a specific user based on type
  private buildUrlWithUserId(baseUrl: string, user: any): string {
    const userId = user.candidateId || user.employeeId;
    return `${baseUrl}/${encodeURIComponent(userId)}`;
  } 

  // Reset all selection data
  resetSelectionData(): void {
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDateTime = '';
  }

  trackById(item: any): number {
    return item.id;
  }
}
