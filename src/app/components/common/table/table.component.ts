import { Component, Input, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { CommonModule } from '@angular/common';

interface Row {
  [key: string]: any;  // This allows dynamic row properties
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input() tableName: string = '';         // Specifies the table name
  @Input() tableData: Row[] = [];          // Data for the table to display
  @Input() tableColumns: string[] = [];    // Columns for the table
  @Input() columnAliases: { [key: string]: string[] } = {};  // Column aliases passed from parent component

  currentPage: number = 1;               // The current page number
  itemsPerPage: number = 10;              // The number of items to display per page (you can make this dynamic)
  totalPages: number = 1;                // The total number of pages

  constructor(private fireBaseService: FireBaseService<any>) { }

  ngOnInit(): void {
    if (this.tableName) {
      // Fetch data dynamically based on the table name passed
      this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
        this.tableData = res;
        this.totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);  // Calculate total pages based on data
      });
    }
  }

  // Function to get the aliases for a given column
  getColumnAliases(column: string): string[] {
    return this.columnAliases[column] || [column];  // Return the column name if no alias is found
  }

  // Get the data for the current page
  getPaginatedData(): Row[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.tableData.slice(startIndex, endIndex);
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}