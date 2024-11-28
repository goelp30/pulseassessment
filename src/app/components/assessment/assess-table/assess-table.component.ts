import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';  // Import the popup modal component
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assess-table',
  standalone: true,
  imports: [TableComponent, PopupModuleComponent, CommonModule, FormsModule],  // Import required modules
  templateUrl: './assess-table.component.html',
  styleUrls: ['./assess-table.component.css']
})
export class AssessTableComponent implements OnInit {
  assessments: Assessment[] = [];
  tableColumns: string[] = ['assessmentId', 'assessmentName', 'assessmentType'];  // Column names for the table
  columnAliases: { [key: string]: string[] } = {
    assessmentId: ['Assessment ID'],
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type']
  };
  tableName: string = TableNames.Assessment;
  searchQuery: string = '';
  
  isModalVisible: boolean = false;  // Controls modal visibility for editing
  selectedAssessment: Assessment | null = null;  // Holds data for the selected assessment for editing

  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.editAssessment(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.deleteAssessment(row),
    },
    {
      label: 'View',
      colorClass: 'bg-green-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.viewAssessment(row),
    },
  ];

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Assessment>) { }

  ngOnInit(): void {
    this.getAssessments();  // Fetch all assessments when the component loads
  }

  logout() {
    this.auth.logout();
  }

  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;  // Update search query
  }

  addAssessment() {
    const uniqueId = crypto.randomUUID();
    const assess: Assessment = {
      assessmentId: uniqueId,
      assessmentName: (Math.random() + 1).toString(36).substring(7),  // Generate a random name
      assessmentType: 'internal',  // Default type is internal
      dateCreated: Date.now(),
      dateUpdated: Date.now(), // Initial lastUpdated value
    };
    this.fireBaseService.create(TableNames.Assessment + '/' + uniqueId, assess);  // Add new assessment to Firebase
  }

  getAssessments() {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);  // Log the assessments fetched from Firebase
    });
  }

  // Button actions

  // Open the edit modal for the selected assessment
  editAssessment(row: any) {
    console.log('Editing assessment:', row);
    this.selectedAssessment = { ...row };  // Create a copy of the selected assessment
    this.isModalVisible = true;  // Display the modal for editing
  }
  
  // Update the selected assessment in Firebase
  updateAssessment() {
    if (this.selectedAssessment) {
      console.log('Updating assessment:', this.selectedAssessment);
      // Update the `dateUpdated` field to the current time
      this.selectedAssessment.dateUpdated = Date.now();
      
      this.fireBaseService.update(
        `${this.tableName}/${this.selectedAssessment.assessmentId}`,
        this.selectedAssessment
      ).then(() => {
        console.log('Assessment updated successfully');
        this.isModalVisible = false;  // Close the modal after successful update
      }).catch(error => {
        console.error('Error updating assessment:', error);
      });
    }
  }
  
  // Mark assessment as deleted (disabled)
  deleteAssessment(row: any) {
    console.log('Deleting assessment:', row);
    
  }

  // View the details of the assessment
  viewAssessment(row: any) {
    console.log('Viewing assessment:', row);
    // Implement additional logic to view the assessment's details, for example, in a new modal or view page
  }
}
