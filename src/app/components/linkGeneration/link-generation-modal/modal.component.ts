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

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assessmentType']) {
      this.loadData();
    }

    if (changes['searchQuery']) {
      this.filterNames();
    }
  }

  loadData(): void {
    if (this.assessmentType === 'internal') {
      this.employees = employeesData;
      this.filteredNames = [...this.employees];
    } else {
      this.candidates = candidatesData;
      this.filteredNames = [...this.candidates];
    }

    this.filterNames();
  }

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

    this.updateSelectAllState();
  }

  toggleSelection(name: any): void {
    const index = this.selectedNames.indexOf(name);

    if (index === -1) {
      this.selectedNames.push(name);
    } else {
      this.selectedNames.splice(index, 1);
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
  }

  updateSelectAllState(): void {
    this.selectAll = this.selectedNames.length === this.filteredNames.length;
  }

  closeModal(): void {
    this.resetSelectionData();
    this.closeModalEvent.emit();
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.filterNames();
  }

  removeSelectedName(name: any): void {
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
    this.expiryDate = event.target.value;
  }

  onSend(): void {
    console.log('Sending data:', {
      selectedNames: this.selectedNames,
      expiryDate: this.expiryDate,
      link: this.link,
    });

    this.resetSelectionData();
    this.closeModal();
  }

  resetSelectionData(): void {
    this.selectedNames = [];
    this.selectAll = false;
    this.filteredNames.forEach((name) => (name.selected = false));
    this.expiryDate = '';
  }
}
