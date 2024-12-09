import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { SearchbarComponent } from '../searchbar/searchbar.component';

interface Row {
  [key: string]: any;
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
  @Input() tableData: any[] = [];
  @Input() tableColumns: string[] = [];
  @Input() columnAliases: { [key: string]: string[] } = {};
  @Input() buttons: { label: string, colorClass: string, action: Function }[] = [];
  @Input() searchQuery: string = '';
  @Input() onSearchQueryChange: (newQuery: string) => void = () => {};
  @Input() tabs: string[] = []; // Empty array means no tabs
  @Input() filterKey: string = '';
  @Input() tabAliases: { [key: string]: string } = {};
  @Input() searchPlaceholder:string=''

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  filteredData: any[] = [];
  activeTab: string = '';  // Initially, no active tab
  pageNumbers: number[] = [];

  constructor(private fireBaseService: FireBaseService<any>) {}

  ngOnInit(): void {
    if (this.tableData && this.tableData.length > 0) {
      // Mock data exists, prioritize mock data and use it directly
      this.initializeTable();
    } else if (this.tableName) {
      // No mock data, fetch from Firebase
      this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
        this.tableData = res;
        this.initializeTable();
      });
    }
  }
  
  initializeTable(): void {
    this.totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);
    this.generatePagination();
    this.filterData();
  
    if (this.tabs.length > 0) {
      this.activeTab = this.tabs[0];
    }
  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery'] || changes['tableData']) {
      this.filterData();
    }
    if (changes['tabs'] || changes['filterKey']) {
      this.filterData();
    }
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.filterData();
  }

  filterData(): void {
    let filtered = [...this.tableData];

    if (this.activeTab && this.activeTab !== 'all') {
      filtered = filtered.filter(row => {
        return row[this.filterKey]?.toString().toLowerCase() === this.activeTab.toLowerCase();
      });
    }

    if (this.searchQuery) {
      filtered = filtered.filter(row => {
        return this.tableColumns.some(column => {
          return row[column] && row[column].toString().toLowerCase().includes(this.searchQuery.toLowerCase());
        });
      });
    }

    this.filteredData = filtered;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.generatePagination();
    this.currentPage = 1;
  }

  getColumnAliases(column: string): string[] {
    return this.columnAliases[column] || [column];
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
    for ( let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    this.pageNumbers = pages;
  }
}