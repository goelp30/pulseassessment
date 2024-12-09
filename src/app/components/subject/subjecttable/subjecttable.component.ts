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
import { ButtonComponent } from '../../common/button/button.component';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subjecttable',
  standalone: true,
  imports: [
    TableComponent,
    PopupModuleComponent,
    CommonModule,
    FormsModule,
    ToastrModule,
    HeaderComponent,
    ButtonComponent,
  ],
  templateUrl: './subjecttable.component.html',
  styleUrls: ['./subjecttable.component.css'],
})
export class SubjectTableComponent {
  // Data properties
  subjects: Subject[] = [];
  tableColumns: (keyof Subject)[] = ['subjectName'];
  columnAliases: { [key: string]: string[] } = {
    subjectName: ['Subject Name'],
  };

  // Modal and state management
  tableName: string = TableNames.Subject;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isAddModal: boolean = false;
  selectedSubject: Subject | null = null;

  // Action buttons for table
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

  modaltitle: string = 'Add Subject';

  // Dependency injection
  constructor(
    private auth: AuthService,
    private fireBaseService: FireBaseService<Subject>,
    private toastr: ToastrService,
    private subjectService: SubjectService, // Inject SubjectService
    private router: Router // Inject Router
  ) {}

  // Logout method
  logout() {
    this.auth.logout();
  }

  // Handle search input changes
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }

  // Add new subject
  addSubject() {
    this.selectedSubject = {
      subjectId: crypto.randomUUID(),
      subjectName: '',
      createdOn: Date.now(),
      UpdatedOn: Date.now(),
      isDisabled: false,
    };
    this.isModalVisible = true;
    this.isAddModal = true;
  }

  // Save a new subject to the database
  saveNewSubject() {
    if (this.selectedSubject) {
      this.toastr.success('Subject added successfully', 'Added', { timeOut: 2000 });

      this.fireBaseService
        .create(`${this.tableName}/${this.selectedSubject.subjectId}`, this.selectedSubject)
        .then(() => {
          this.isModalVisible = false;
          this.selectedSubject = null;
        })
        .catch((error) => {
          console.error('Error adding subject:', error);
        });
    }
  }

  // Edit an existing subject
  editSubject(row: any) {
    this.selectedSubject = { ...row };
    this.isModalVisible = true;
    this.isAddModal = false;
  }

  // Update an existing subject
  updateSubject() {
    if (this.selectedSubject) {
      this.toastr.info('Subject updated successfully', 'Updated', { timeOut: 2000 });

      this.fireBaseService
        .update(`${this.tableName}/${this.selectedSubject.subjectId}`, this.selectedSubject)
        .then(() => {
          this.isModalVisible = false;
          this.selectedSubject = null;
        })
        .catch((error) => {
          console.error('Error updating subject:', error);
        });
    }
  }

  // Delete subject
  deleteSubject(row: Subject) {
    this.toastr.error('Subject deleted');
  }

  // Manage subject: Store subjectId and navigate to /questions
  manageSubject(row: Subject) {
    if (row.subjectId) {
      this.subjectService.setSubjectId(row.subjectId); // Store subjectId in service
      this.router.navigate(['/questions']); // Navigate to /questions route
    } else {
      console.error('Subject ID is missing.');
    }
  }
}
