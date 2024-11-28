import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../common/header/header.component';

@Component({
  selector: 'app-subjecttable',
  standalone: true,
  imports: [TableComponent, PopupModuleComponent, CommonModule, FormsModule, ToastrModule,HeaderComponent],
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
  isModalVisible: boolean = false;  // Controls modal visibility for editing and adding subjects
  isAddModal: boolean = false;  // Indicates whether the modal is for adding a new subject or editing
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

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Subject>, private toastr: ToastrService) {}

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
    this.searchQuery = newQuery;
  }

  addSubject() {
    console.log("add new subject", this.selectedSubject);
    this.selectedSubject = {
      subjectId: crypto.randomUUID(),  // Generate a GUID for the subject ID
      subjectName: '',
      createdOn: Date.now(),
      UpdatedOn: Date.now(),
      isDisabled: false,
    };
    this.isModalVisible = true;
    this.isAddModal = true; // Indicate that the modal is for adding a new subject
  }
  

  saveNewSubject() {
    if (this.selectedSubject) {
      console.log('Saving new subject:', this.selectedSubject);
      this.toastr.success('Subject added successfully', 'Added', { timeOut: 2000 });

      this.fireBaseService.create(`${this.tableName}/${this.selectedSubject.subjectId}`, this.selectedSubject)
        .then(() => {
          this.isModalVisible = false;  // Close the modal after saving
          this.selectedSubject = null;  // Reset selected subject
        }).catch(error => {
          console.error('Error adding subject:', error);
        });
    }
  }

  editSubject(row: any) {
    console.log('Editing subject:', row);
    this.selectedSubject = { ...row };
    this.isModalVisible = true;
    this.isAddModal = false;  // Indicate that the modal is for editing
  }

  updateSubject() {
    if (this.selectedSubject) {
      console.log('Updating subject:', this.selectedSubject);
      this.toastr.info('Subject updated successfully', 'Updated', { timeOut: 2000 });

      this.fireBaseService.update(`${this.tableName}/${this.selectedSubject.subjectId}`, this.selectedSubject)
        .then(() => {
          this.isModalVisible = false;  // Close the modal after updating
          this.selectedSubject = null;  // Reset selected subject
        }).catch(error => {
          console.error('Error updating subject:', error);
        });
    }
  }

  deleteSubject(row: any) {
    console.log('Deleting subject:', row);
    this.toastr.error("Subject Removed Successfully", "Removed", { timeOut: 2000 });

    const subjectToDelete = this.subjects.find(subject => subject.subjectId === row.subjectId);
    if (subjectToDelete) {
      subjectToDelete.isDisabled = true;

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
