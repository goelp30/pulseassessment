import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { SearchbarComponent } from '../searchbar/searchbar.component';

interface Row {
  [key: string]: any;  // This allows dynamic row properties
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SearchbarComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() tableName: string = '';
  @Input() tableData: any[] = [];  // Data for the table to display(rows)
  @Input() tableColumns: string[] = [];  // Columns for the table(column heads)
  @Input() columnAliases: { [key: string]: string[] } = {};
  @Input() buttons: { label: string, colorClass: string, action: Function }[] = [];
  @Input() searchQuery: string = '';  // Search query input
  @Input() onSearchQueryChange: (newQuery: string) => void = () => {};  // Function to handle search query change
  @Input() tabs: string[] = ['all'];  // Tabs to be displayed, default to ['all']
  @Input() filterKey: string = ''; // The key in the row data to filter by (e.g., 'assessmentType')

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  filteredData: any[] = [];
  activeTab: string = 'all';  // Initially, the 'all' tab is selected

  constructor(private fireBaseService: FireBaseService<any>) {}

  ngOnInit(): void {
    if (this.tableName) {
      // Fetch data dynamically based on the table name passed
      this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
        this.tableData = res;
        this.totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);
        this.filterData();  // Filter data when it loads
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if searchQuery has changed
    if (changes['searchQuery']) {
      this.filterData();  // Filter data when the searchQuery changes
    }
    // Check if tabs or filterKey changed
    if (changes['tabs'] || changes['filterKey']) {
      this.filterData();  // Re-filter based on new tabs or key
    }
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.filterData();  // Re-filter data when a new tab is selected
  }

  filterData(): void {
    let filtered = [...this.tableData];  // Copy the data

    // Apply filter based on the active tab
    if (this.activeTab && this.activeTab !== 'all') {
      filtered = filtered.filter(row => {
        return row[this.filterKey]?.toString().toLowerCase() === this.activeTab.toLowerCase();
      });
    }

    // Apply search query filtering
    if (this.searchQuery) {
      filtered = filtered.filter(row => {
        return this.tableColumns.some(column => {
          return row[column] && row[column].toString().toLowerCase().includes(this.searchQuery.toLowerCase());
        });
      });
    }

    this.filteredData = filtered;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.currentPage = 1;  // Reset to first page after filtering
  }

  getColumnAliases(column: string): string[] {
    return this.columnAliases[column] || [column];
  }

  getPaginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);  // Return paginated filtered data
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
