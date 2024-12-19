import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { HeaderComponent } from '../../common/header/header.component';
import { TableComponent } from '../../common/table/table.component';
import { QuestionmodalComponent } from '../questionmodal/questionmodal.component';
import { CommonModule } from '@angular/common';
import { Option } from '../../../models/question';
import { TableNames } from '../../../enums/TableName';
import { Question } from '../../../models/question';
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ButtonComponent } from '../../common/button/button.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-questiontable',
  standalone: true,
  templateUrl: './questiontable.component.html',
  styleUrls: ['./questiontable.component.css'],
  imports:[HeaderComponent,TableComponent,QuestionmodalComponent,CommonModule,PopupModuleComponent,ButtonComponent,RouterModule]
})
export class QuestiontableComponent implements OnInit {

  questions: Question[] = [];
  options: Option[] = [];

  selectedQuestion: Question = {
    subjectId: '',
    questionId: '',
    questionText: '',
    questionType: '',
    questionLevel: '',
    questionWeightage: 1,
    questionTime: 60,
    createdOn: Date.now(),
    updatedOn: Date.now(),
  };

  isQuestionModalVisible: boolean = false;

  subjectId: string = '';
  isquDisabled:boolean=false;
  selectedQuestionToDelete: Question | null = null;
  eConfirmationVisible: boolean = false;
  QuestionToDelete:boolean=false;
  isQuesDisabled:boolean=false;

  // Table Configurations
  tableColumns: (keyof Question)[] = ['questionText'];
  columnAliases: { [key: string]: string[] } = {
    questionText: ['Question Text']
  };
  

  

  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-custom-blue hover:opacity-80 transition-opacity text-white py-2 px-4 text-white rounded-md',
      action: (row: Question) => this.editQuestion(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 hover:opacity-80 transition-opacity py-2 px-4 text-white rounded-md',
      action: (row: any) => this.confirmDelete(row),
 
    },
  ];

 
  searchPlaceholder: string = 'Search Questions';
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isAddModal: boolean = false;
  subjectName: string='';
backbutton={
  label:"Back to subject",
  colorClass:"bg-custom-blue hover:opacity-80 transition-opacity text-white py-2 px-4 text-white rounded-md",
};


  constructor(
    private toastr: ToastrService,
    private subjectService: SubjectService,
    private fireBaseService: FireBaseService<Question>,
    private router:Router
  ) {}

  ngOnInit(): void {
    // Retrieve subjectId and subjectName from localStorage on component initialization
    const savedSubjectId = localStorage.getItem('subjectId');
    const savedSubjectName = localStorage.getItem('subjectName');
  
    if (savedSubjectId && savedSubjectName) {
      this.subjectId = savedSubjectId;
      this.subjectName = savedSubjectName;
      console.log('Retrieved subjectId from localStorage:', this.subjectId);
      console.log('Retrieved subjectName from localStorage:', this.subjectName);
      this.fetchQuestions();
    }
  
    // Subscribe to subjectId and subjectName changes and save them to localStorage
    this.subjectService.subjectId$.subscribe((subjectId) => {
      if (subjectId) {
        this.subjectId = subjectId;
        console.log('New subjectId received:', this.subjectId);
  
        // Save subjectId to localStorage
        localStorage.setItem('subjectId', subjectId);
  
        this.fetchQuestions();
      }
    });
  
    this.subjectService.subjectName$.subscribe((subjectName) => {
      if (subjectName) {
        this.subjectName = subjectName;
        console.log('New subjectName received:', this.subjectName);
  
        // Save subjectName to localStorage
        localStorage.setItem('subjectName', subjectName);
      }
    });
  }

  navigatetosubject() {
    this.router.navigate(['/subjects']);

  }
  
  fetchQuestions(): void {
    this.fireBaseService.listensToChangeWithFilter('questions', 'subjectId', this.subjectId).subscribe(
      (data) => {
        console.log('Raw data:', data); // Check for any disabled questions
        this.questions = data.filter(question => !question.isQuesDisabled);
        console.log('Active questions:', this.questions);
      },
      (error:Error) => {
        console.error('Error while loading questions:', error);
      }
    );
  }
  
  
  
  
  addQuestion() {
    this.selectedQuestion = {
      subjectId: this.subjectId,
      questionId: crypto.randomUUID(),
      questionText: '',
      questionType: 'Single',
      questionLevel: 'Easy',
      questionWeightage: 1,
      questionTime: 1,
      createdOn: Date.now(),
      updatedOn: Date.now(),
    };
    this.isQuestionModalVisible = true;
    this.isAddModal=true; // Open only for adding a new question
  }
  

  saveQuestion() {
    if (this.selectedQuestion.questionText.trim() === '') {
      this.toastr.error('Question text is required.');
      return;
    }
  
    this.fireBaseService
      .addData(`questions/${this.subjectId}`, this.selectedQuestion.questionId, this.selectedQuestion)
      .then(() => {
        this.questions.push({ ...this.selectedQuestion });
        this.toastr.success('Question added successfully!');
        this.isQuestionModalVisible = false; // Only close here
      })
      .catch((error: Error) => {
        console.error('Error adding question:', error);
        this.toastr.error('Error adding question');
      });
  }
  

// Delete subject
  confirmDelete(question:Question) {
    this.selectedQuestionToDelete = question;
    this.eConfirmationVisible = true;
  }
  deleteQuestion() {
    if (this.selectedQuestionToDelete) {
      const questionToDelete = this.selectedQuestionToDelete;
      questionToDelete.isQuesDisabled = true; // Mark as disabled in the Questions table
  
      // First, update the 'Questions' table to mark the question as disabled
      this.fireBaseService.update(`questions/${questionToDelete.questionId}`, questionToDelete)
        .then(() => {
          // Once the question is marked as disabled, update the related Options entries
  
          // Get all Options entries and update the ones that reference this questionId
          this.fireBaseService.getAllDataByFilter('options', 'isOptionDisabled', false).subscribe((optionsList: Option[]) => {
            const optionsToUpdate = optionsList.filter((option) => option.questionId === questionToDelete.questionId);
            
            // For each Option entry related to the deleted question
            const updatePromises = optionsToUpdate.map((option) => {
              option.isOptionDisabled = true; // Mark as disabled in the Options table
              return this.fireBaseService.update(`options/${option.optionId}`, option);
            });
  
            // Wait for all updates to be completed
            Promise.all(updatePromises)
              .then(() => {
                this.toastr.success('Question deleted successfully', 'Deleted');
                this.eConfirmationVisible = false;
                this.fetchQuestions(); // Refresh the questions list after deletion
              })
              .catch((error) => {
                console.error('Error updating Options entries:', error);
                this.toastr.error('Failed to update related options', 'Error');
              });
          });
        })
        .catch((error) => {
          console.error('Error deleting question:', error);
          this.toastr.error('Failed to delete question', 'Error');
        });
    }
  }
  
  
  
  
  closeModal(): void {
    this.isModalVisible = false; 
    this.eConfirmationVisible = false;
  }
  editQuestion(row: Question): void {
    this.selectedQuestion = { ...row };
    this.isQuestionModalVisible = true;
    this.isAddModal=false;
  }
  closeQuestionModal() {
    this.isQuestionModalVisible = false;
  }
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
  handleCloseModal(): void {
    // Logic to close the modal (e.g., hide modal or remove component)
    this.isQuestionModalVisible = false;
  }
  
}