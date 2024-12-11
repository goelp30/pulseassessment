import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { HeaderComponent } from '../../common/header/header.component';
import { QuestionmodalComponent } from '../../common/questionmodal/questionmodal.component';
import { TableComponent } from '../../common/table/table.component';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/question';


@Component({
  selector: 'app-mockquestion',
  standalone: true,
  templateUrl: './mockquestion.component.html',
  styleUrls: ['./mockquestion.component.css'],
  imports: [HeaderComponent,QuestionmodalComponent,TableComponent,CommonModule]
})
export class MockquestionComponent implements OnInit {
  questions: Question[] = [];
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

  // Table-related configurations
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
    }
  ];

  searchQuery: string = '';
  isModalVisible: boolean = false;

  constructor(
    private toastr: ToastrService,
    private subjectService: SubjectService,
    private fireBaseService: FireBaseService<Question>
  ) {}

  ngOnInit() {
    this.loadQuestions();
  }

  // Load data from Firebase
  private loadQuestions() {
    this.fireBaseService.getAllData('questions').subscribe(
      (response: Question[]) => {
        this.questions = response;
      },
      (error) => {
        console.error('Error loading questions:', error);
        this.toastr.error('Error loading questions');
      }
    );
  }

  addQuestion() {
    this.selectedQuestion = {
      subjectId: '',
      questionId: crypto.randomUUID(),
      questionText: '',
      questionType: '',
      questionLevel: '',
      questionWeightage: 1,
      questionTime: 60,
      createdOn: Date.now(),
      updatedOn: Date.now(),
    };
    this.isQuestionModalVisible = true;
  }

  saveQuestion() {
    if (this.selectedQuestion.questionText.trim() === '') {
      this.toastr.error('Question text is required');
      return;
    }

    this.fireBaseService
      .addData(`questions/${this.selectedQuestion.subjectId}`, this.selectedQuestion.questionId, this.selectedQuestion)
      .then(() => {
        this.questions.push({ ...this.selectedQuestion });
        this.toastr.success('Question added successfully!');
        this.isQuestionModalVisible = false;
      })
      .catch((error: Error) => {
        console.error('Error adding question:', error);
        this.toastr.error('Error saving question');
      });
  }

  deleteQuestion(row: Question): void {
    const index = this.questions.findIndex((q) => q.questionId === row.questionId);
    if (index !== -1) {
      this.questions.splice(index, 1);
      this.toastr.success('Deleted successfully');
    } else {
      this.toastr.error('Failed to delete');
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
