import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subjecttable',
  standalone: true,
  imports: [TableComponent,PopupModuleComponent,CommonModule,FormsModule],
  templateUrl: './subjecttable.component.html',
  styleUrls: ['./subjecttable.component.css']
})
export class SubjectTableComponent implements OnInit {
  subjects: Subject[] = [];
  tableColumns: string[] = ['subjectId', 'subjectName'];
  columnAliases: { [key: string]: string[] } = {
    subjectId: ['subject ID'],
    subjectName: ['subject Name'],
  };
  tableName: string = TableNames.Subject;
  searchQuery: string = '';
  isModalVisible: boolean = false;  // Controls modal visibility
  selectedSubject: Subject | null = null;  // Holds data for the selected subject

  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.editSubject(row),
    },
    {
      label: 'Manage',
      colorClass: 'bg-green-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.manageSubject(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.deleteSubject(row),
    },
  ];

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Subject>) {}

  ngOnInit(): void {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });
  }

  logout() {
    this.auth.logout();
  }
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;  // Update the search query
  }

  addSubject() {
    const uniqueId = crypto.randomUUID();
    const subject: Subject = {
      subjectId: uniqueId,
      subjectName: (Math.random() + 1).toString(36).substring(7),
      createdOn: Date.now(),
      UpdatedOn: Date.now()
    };
    this.fireBaseService.create(TableNames.Subject + '/' + uniqueId, subject);
  }

  getSubject() {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });
  }

  // Button actions
// This method sets the selectedSubject and opens the modal for editing.
editSubject(row: any) {
  console.log('Editing subject:', row);
  this.selectedSubject = { ...row };  // Create a copy of the selected subject to work with
  this.isModalVisible = true;  // Show the modal
}

// This method updates the subject in the database and closes the modal.
updateSubject() {
  if (this.selectedSubject) {
    console.log('Updating subject:', this.selectedSubject);

    // Update the subject data in Firebase (or your data service)
    this.fireBaseService.update(
      `${this.tableName}/${this.selectedSubject.subjectId}`,
      this.selectedSubject
    ).then(() => {
      console.log('Subject updated successfully');
      this.isModalVisible = false;  // Close the modal after updating
    }).catch(error => {
      console.error('Error updating subject:', error);
    });
  }
}


deleteSubject(row: any) {
  console.log('Deleting subject:', row);
  
  // Find the subject in the array and set isDisabled to true
  const subjectToDelete = this.subjects.find(subject => subject.subjectId === row.subjectId);
  if (subjectToDelete) {
    subjectToDelete.isDisabled = true;  // Set isDisabled to true

    // Update the subject in the database
    this.fireBaseService.update(`${this.tableName}/${subjectToDelete.subjectId}`, subjectToDelete)
      .then(() => {
        console.log('Subject disabled successfully');
      })
      .catch(error => {
        console.error('Error disabling subject:', error);
      });
  }
}


  manageSubject(row: any) {
    console.log('Managing subject:', row);
    // Implement manage logic here
  }
}
