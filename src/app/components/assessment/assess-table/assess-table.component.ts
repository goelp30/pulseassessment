import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';

@Component({
  selector: 'app-assess-table',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './assess-table.component.html',
  styleUrls: ['./assess-table.component.css']
})
export class AssessTableComponent implements OnInit {
  assessments: Assessment[] = [];
  tableColumns: string[] = ['assessmentId', 'assessmentName', 'assessmentType'];  // Column names to be passed to TableComponent
  columnAliases: { [key: string]: string[] } = {
    assessmentId: ['Assessment ID'],
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type']
  };
  tableName: string = TableNames.Assessment;
  searchQuery: string = '';

  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;  // Update the search query
  }

  // Define the button array to pass to TableComponent
  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-blue-500 py-2 px-4 text-white',
      action: (row: any) => this.editAssessment(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 py-2 px-4 text-white',
      action: (row: any) => this.deleteAssessment(row),
    },
    {
      label: 'View',
      colorClass: 'bg-green-500 py-2 px-4 text-white',
      action: (row: any) => this.viewAssessment(row),
    },
  ];

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Assessment>) { }

  ngOnInit(): void {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }

  logout() {
    this.auth.logout();
  }

  addAssessment() {
    const uniqueId = crypto.randomUUID();
    const assess: Assessment = {
      assessmentId: uniqueId,
      assessmentName: (Math.random() + 1).toString(36).substring(7),
      assessmentType: 'internal',
      subjectId: '',
      subjectName: '',
      dateCreated: 0
    };
    this.fireBaseService.create(TableNames.Assessment + '/' + uniqueId, assess);
  }

  getAssessment() {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }

  // Button actions
  editAssessment(row: any) {
    console.log('Editing assessment:', row);
    // Implement your edit logic here
  }

  deleteAssessment(row: any) {
    console.log('Deleting assessment:', row);
   
  }
  

  viewAssessment(row: any) {
    console.log('Viewing assessment:', row);
    // Implement your view logic here
  }
}
