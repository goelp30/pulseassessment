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

export type Question = {
  subjectId: string;
  questionId: any;
  questionText: any;
  questionType: string;
  questionLevel: string;
  questionWeightage: number;
  questionTime: number;
  createdOn: number;
  updatedOn: number;
  isQuesDisabled?: boolean;
};

@Component({
  selector: 'app-questiontable',
  standalone: true,
  templateUrl: './questiontable.component.html',
  styleUrls: ['./questiontable.component.css'],
  imports:[HeaderComponent,TableComponent,QuestionmodalComponent,CommonModule]
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

  // Table Configurations
  tableColumns: (keyof Question)[] = ['questionText'];
  columnAliases: { [key: string]: string[] } = {
    questionText: ['Question Text']
  };
  

  

  buttons = [
    {
      label: 'Edit',
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: Question) => this.editQuestion(row),
    },
    {
      label: 'Delete',
      colorClass: 'bg-red-500 py-2 px-4 text-white rounded-md',
      action: (row: Question) => this.deleteQuestion(row),
    },
  ];

 
  searchPlaceholder: string = 'Search Questions';
  tableName: string = TableNames.Question;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isAddModal: boolean = false;
  subjectName: string='';


  constructor(
    private toastr: ToastrService,
    private subjectService: SubjectService,
    private fireBaseService: FireBaseService<Question>
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
  
  
  fetchQuestions(): void {
    this.fireBaseService
      .getItemsByFields('questions', ['subjectId'], this.subjectId)
      .subscribe(
        (data) => {
          this.questions = data;
          console.log(this.questions)
        },
        (error) => {
          console.error('Error while loading questions:', error);
        }
      );
  }
  
  
  addQuestion() {
    this.selectedQuestion = {
      subjectId: this.subjectId,
      questionId: crypto.randomUUID(),
      questionText: '',
      questionType: '',
      questionLevel: '',
      questionWeightage: 1,
      questionTime: 1,
      createdOn: Date.now(),
      updatedOn: Date.now(),
    };
    this.isQuestionModalVisible = true; // Open only for adding a new question
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
  

  deleteQuestion(row: Question): void {
    const index = this.questions.findIndex((q) => q.questionId === row.questionId);
    if (index !== -1) {
      this.questions.splice(index, 1);
      this.toastr.success('Deleted successfully');
    } else {
      this.toastr.error('Failed to delete the question');
    }
  }

  editQuestion(row: Question): void {
    this.selectedQuestion = { ...row };
    this.isQuestionModalVisible = true;
    this.toastr.info('Edit mode activated');
  }
  closeQuestionModal() {
    this.isQuestionModalVisible = false;
  }
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
}