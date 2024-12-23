import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { Question } from '../../../models/question';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subjecttable',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableComponent,
    PopupModuleComponent,
    CommonModule,
    FormsModule,
    ToastrModule,
    ButtonComponent,
  ],
  templateUrl: './subjecttable.component.html',
  styleUrls: ['./subjecttable.component.css'],
})
export class SubjectTableComponent  implements OnInit{
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
  searchPlaceholder:string='Search Subjects'
  isDisabled:boolean=false;
  selectedSubjectToDelete: Subject | null = null;
  eConfirmationVisible: boolean = false;
  SubjectToDelete:boolean=false;
 
 

  // Action buttons for table
  buttons = [
    {
      label: '',
      icon: 'fa fa-pen px-2 text-lg ',  // Font Awesome Edit Icon
      colorClass: 'bg-custom-blue hover:opacity-80 transition-opacity text-white rounded-md px-4 py-1 ', 
      action: (row: any) => this.editSubject(row),
      title:"Edit"
    },    
    {
      label: '',
      icon: 'fas fa-cog px-2 text-xl',  // Font Awesome Manage Icon
      colorClass: 'bg-custom-blue hover:opacity-80 transition-opacity text-white rounded-md px-4 py-1',
      action: (row: any) => this.manageSubject(row),
      title:"Manage"
    },
    {
      label: '',
      icon: 'fa fa-trash px-2 text-lg ',  // Font Awesome Delete Icon
      colorClass: 'bg-red-500 hover:opacity-80 transition-opacity text-white rounded-md px-4 py-1',
      action: (row: any) => this.confirmDelete(row),
      title:"Delete"
    },
  ];
  

  modaltitle: string = 'Add Subject';
 private routerSubscription!: Subscription;
addbuttonlabel:string='add';

  // Dependency injection
  constructor(
    private auth: AuthService,
    private fireBaseService: FireBaseService<Subject>,
    private toastr: ToastrService,
    private subjectService: SubjectService, // Inject SubjectService
    private router: Router, // Inject Router
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchSubjects();
  
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects.includes('/subjects')) {
        this.fetchSubjects(); // Refetch subjects on navigation
      }
    });
  }

  fetchSubjects(): void {
    this.fireBaseService.listensToChangeWithFilter(this.tableName, 'isDisabled', false).subscribe(
      (data: Subject[]) => {
        this.subjects = data
          .filter(subject => !subject.isDisabled) // Exclude disabled subjects
        
        this.cdr.markForCheck(); // Trigger change detection manually
      },
      (error: Error) => {
        console.error('Error while fetching real-time subjects:', error);
      }
    );
  }
  
  


  // Logout method
  logout() {
    this.auth.logout();
  }

  // Handle search input changes
  onSearchQueryChange(newQuery: string): void {
    this.fetchSubjects();
    this.searchQuery = newQuery;
  }

  // Add new subject
  addSubject() {
    this.fetchSubjects();
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
    if (!this.selectedSubject || !this.selectedSubject.subjectName || this.selectedSubject.subjectName.trim() === '') {
      this.toastr.warning('Please enter subject name', 'Warning', { timeOut: 2000 });
      return;
    }
  
    // Use a single subscription
    const subscription = this.fireBaseService.getAllDataByFilter(this.tableName, 'isDisabled', false)
      .subscribe(subjects => {
        const isDuplicate = subjects.some(subject =>
          subject.subjectName.trim().toLowerCase() === this.selectedSubject?.subjectName.trim().toLowerCase()
        );
  
        if (isDuplicate) {
          this.toastr.warning('Subject already exists', 'Warning', { timeOut: 2000 });
        } else {
          // Proceed with adding the new subject if no duplicates
          this.fireBaseService.create(`${this.tableName}/${this.selectedSubject!.subjectId}`, this.selectedSubject)
            .then(() => {
              this.toastr.success('Subject added successfully', 'Added', { timeOut: 2000 });
              this.isModalVisible = false;
              this.closeModal();
              this.selectedSubject = null;
              this.fetchSubjects();
            })
            .catch((error) => {
              console.error('Error adding subject:', error);
            });
        }
  
        subscription.unsubscribe(); // Unsubscribe after the operation
      });
  }
  

  // Edit an existing subject
  editSubject(row: any) {
    this.fetchSubjects();
    this.selectedSubject = { ...row };
    this.isModalVisible = true;
    this.isAddModal = false;
  }

  // Update an existing subject
  updateSubject() {
    if (!this.selectedSubject || !this.selectedSubject.subjectName || this.selectedSubject.subjectName.trim() === '') {
      this.toastr.warning('Please enter subject name', 'Warning', { timeOut: 2000 });
      return;
    }
  
    // Use a single subscription
    const subscription = this.fireBaseService.getAllDataByFilter(this.tableName, 'isDisabled', false)
      .subscribe(subjects => {
        const isDuplicate = subjects.some(subject =>
          subject.subjectId !== this.selectedSubject?.subjectId &&
          subject.subjectName.trim().toLowerCase() === this.selectedSubject?.subjectName.trim().toLowerCase()
        );
  
        if (isDuplicate) {
          this.toastr.warning('Subject already exists', 'Warning', { timeOut: 2000 });
        } else {
          // Proceed with updating the subject if no duplicates
          this.fireBaseService.update(`${this.tableName}/${this.selectedSubject!.subjectId}`, this.selectedSubject!)
            .then(() => {
              this.toastr.info('Subject updated successfully', 'Updated', { timeOut: 2000 });
              this.isModalVisible = false;
              this.closeModal();
              this.selectedSubject = null;
              this.fetchSubjects();
            })
            .catch((error) => {
              console.error('Error updating subject:', error);
            });
        }
  
        subscription.unsubscribe(); // Unsubscribe after the operation
      });
  }
  

  // Delete subject
  confirmDelete(subject: Subject) {
    this.fetchSubjects();
    this.selectedSubjectToDelete = subject;
    this.eConfirmationVisible = true;
  }
  deleteSubject() {
    if (this.selectedSubjectToDelete) {
      const subjectToDelete = this.selectedSubjectToDelete;
      subjectToDelete.isDisabled = true; // Mark the subject as disabled
  
      // First, update the subject to mark it as disabled
      this.fireBaseService.update(`${this.tableName}/${subjectToDelete.subjectId}`, subjectToDelete)
        .then(() => {
          // Once the subject is marked as disabled, fetch all questions associated with the subject
          this.fireBaseService.getAllDataByFilter('questions', 'isQuesDisabled', false).subscribe((questionsList: Question[]) => {
            const questionsToUpdate = questionsList.filter((question) => question.subjectId === subjectToDelete.subjectId);
  
            // Disable all questions associated with this subject
            const updatePromises = questionsToUpdate.map((question) => {
              question.isQuesDisabled = true;
              return this.fireBaseService.update(`questions/${question.questionId}`, question);
            });
  
            // Wait for all updates to complete
            Promise.all(updatePromises)
              .then(() => {
                this.toastr.success('Subject and related questions disabled successfully', 'Deleted');
                this.eConfirmationVisible = false;
                this.fetchSubjects();
              })
              .catch((error) => {
                console.error('Error updating related questions:', error);
                this.toastr.error('Failed to update related questions', 'Error');
              });
          });
        })
        .catch((error) => {
          console.error('Error deleting subject:', error);
          this.toastr.error('Failed to delete subject', 'Error');
        });
    }
  }
  
  closeModal(): void {
    this.isAddModal = false;
    this.isModalVisible = false; // For the Assessment Details modal
    this.eConfirmationVisible = false; // For the Delete Confirmation modal
  }
  manageSubject(row: Subject) {
    if (row.subjectId && row.subjectName) {
      this.subjectService.setSubjectId(row.subjectId); // Store subjectId
      this.subjectService.setSubjectName(row.subjectName); // Store subjectName
      this.router.navigate(['/questions']); // Navigate to /questions
    } else {
      console.error('Subject ID or Subject Name is missing.');
    }
  }
}