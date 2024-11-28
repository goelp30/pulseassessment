// table.component.ts
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
  imports: [CommonModule,ButtonComponent,SearchbarComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() tableName: string = '';
  @Input() tableData: any[] = [];         // Data for the table to display(rows)
  @Input() tableColumns: string[] = [];    // Columns for the table(column heads)
  @Input() columnAliases: { [key: string]: string[] } = {};
  @Input() buttons: { label: string, colorClass: string, action: Function }[] = [];
  @Input() searchQuery: string = '';      // Search query input
  @Input() onSearchQueryChange: (newQuery: string) => void = () => {}; // Function to handle search query change

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  filteredData: any[] = [];

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
      this.filterData(); // Filter data when the searchQuery changes
    }
  }

  filterData(): void {
    if (this.searchQuery) {
      this.filteredData = this.tableData.filter(row => {
        return this.tableColumns.some(column => {
          return row[column] && row[column].toString().toLowerCase().includes(this.searchQuery.toLowerCase());
        });
      });
    } else {
      this.filteredData = [...this.tableData];  // If no search, show all data
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page after filtering
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
