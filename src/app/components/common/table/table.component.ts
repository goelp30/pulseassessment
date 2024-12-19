import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    SearchbarComponent,
    FormsModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnChanges {
  @Input() tableName: string = '';
  @Input() tableData: any[] = [];
  @Input() tableColumns: string[] = [];
  @Input() columnAliases: { [key: string]: string[] } = {};
  @Input() buttons: { label: string | ((row: any) => string); colorClass: string; action: Function }[] =
    [];
  @Input() searchQuery: string = '';
  @Input() onSearchQueryChange: (newQuery: string) => void = () => {};
  @Input() tabs: string[] = []; // Empty array means no tabs
  @Input() filterKey: string = '';
  @Input() tabAliases: { [key: string]: string } = {};
  @Input() searchPlaceholder: string = 'Search';

  // Input properties for assessmentRecord filters
  @Input() filterOptions: string[] = [];
  @Input() statusOptions: string[] = [];
  @Input() showAdditionalFilters: boolean = false;

  // New Input for handling status display
  @Input() statusMapping: { [key: string]: string } = {};

  // new input for custom button display
  @Input() customButtonDisplay: { [key: string]: any } = {};

  selectedFilter: string = '';
  selectedStatus: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  filteredData: any[] = [];
  activeTab: string = '';
  pageNumbers: number[] = [];
  isLoading: boolean = true;

  // For link in Assessment records
  isPopupVisible: boolean = false;
  copiedUrl: string | null = null;


  constructor(private fireBaseService: FireBaseService<any>) {}

  ngOnInit(): void {
    if (this.tableName) {
      this.isLoading = true;
      this.fireBaseService
        .getAllDataByFilter(this.tableName, 'isDisabled', false)
        .subscribe((res) => {
          this.tableData = res;
          this.filterData(); // Initial filter to include tab and other filters
          this.totalPages = Math.ceil(
            this.tableData.length / this.itemsPerPage
          );
          this.generatePagination();
          this.isLoading = false;
        });
    }

    if (this.tabs.length > 0) {
      this.activeTab = this.tabs[0];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['searchQuery'] ||
      changes['tableData'] ||
      changes['tabs'] ||
      changes['filterKey']
    ) {
      this.isLoading = true;
      this.filterData();
      this.isLoading = false;
    }
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.filterData();
  }

  onFilterChange(): void {
    this.filterData();
  }

  onStatusChange(): void {
    this.filterData();
  }

  filterData() {
    let filtered = [...this.tableData];

    if (this.searchQuery) {
      filtered = filtered.filter((row) => {
        return this.tableColumns.some((column) => {
          return (
            row[column] &&
            row[column]
              .toString()
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
          );
        });
      });
    }
    if (this.showAdditionalFilters) {
      filtered = this.applyAdditionalFilters(filtered);
    }
    if (this.activeTab && this.activeTab !== 'all') {
      filtered = filtered.filter((row) => {
        return (
          row[this.filterKey]?.toString().toLowerCase() ===
          this.activeTab.toLowerCase()
        );
      });
    }

    this.filteredData = filtered;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.generatePagination();
    this.currentPage = 1;
  }

  // Method to Apply additional filters
  applyAdditionalFilters(data: any[]): any[] {
    let filteredData = [...data];
    if (this.selectedFilter) {
      filteredData = filteredData.filter((row) => {
        const filterValue = row[this.selectedFilter];
        if (!filterValue) return true;
        return filterValue
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    }
    if (this.selectedStatus) {
      filteredData = filteredData.filter((row) => {
        return row.status?.toLowerCase() === this.selectedStatus.toLowerCase();
      });
    }

    return filteredData;
  }

  // Function to get the CSS classes for status display
  getStatusClass(status: string): string {
    return this.statusMapping[status] || '';
  }

  getColumnAliases(column: string): string[] {
    return this.columnAliases[column] || [column];
  }

  getTabAlias(tab: string): string {
    return this.tabAliases[tab] || tab;
  }

  getPaginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.generatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.generatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.generatePagination();
  }

  generatePagination(): void {
    const totalPages = this.totalPages;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    this.pageNumbers = pages;
  }

    getButtonLabel(button:any, row: any): string {
    if (typeof button.label === 'function') {
      return button.label(row);
    }
      return button.label;
  }
  getCustomButtonClasses(button: any, row: any) {
    if (button.customClassFunction) {
      return button.customClassFunction(row);
    }
    return button.colorClass;
  }

  isButtonDisabled(button: any, row: any) {
    if (button.disableFunction) {
      return button.disableFunction(row);
    }
    return false;
  }


  copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(
      () => {
        this.copiedUrl = url; // Set the copied URL to show style changes
        this.showPopup(); // Trigger the popup
      },
      (err) => {
        console.error('Failed to copy URL: ', err);
      }
    );
  }

  showPopup(): void {
    this.isPopupVisible = true;

    // Hide the popup after 2 seconds
    setTimeout(() => {
      this.isPopupVisible = false;
    }, 1000);
  }
}













