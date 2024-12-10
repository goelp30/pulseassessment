import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { HeaderComponent } from '../../common/header/header.component';
import { TableComponent } from '../../common/table/table.component';
import { QuestionmodalComponent } from '../../common/questionmodal/questionmodal.component';
import { CommonModule } from '@angular/common';

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

export type OptionFormat = {
  optionId: string;
  optionText: any;
  isCorrectOption: boolean;
};

export type Option = {
  subjectId: string;
  questionId: string;
  options: {
    [optionId: string]: OptionFormat;
  };
};

@Component({
  selector: 'app-mockquestion',
  standalone: true,
  templateUrl: './mockquestion.component.html',
  styleUrls: ['./mockquestion.component.css'],
  imports:[HeaderComponent,TableComponent,QuestionmodalComponent,CommonModule]
})
export class MockquestionComponent implements OnInit {
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
    questionText: ['Question Text'],
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
    {
      label: 'View Options',
      colorClass: 'bg-green-500 py-2 px-4 text-white rounded-md',
      action: (row: Question) => this.getOptions(row.questionId),
    },
  ];

  tableName: string = 'Questions Table';
  searchQuery: string = '';
  searchPlaceholder: string = 'Search Questions';

  constructor(
    private toastr: ToastrService,
    private subjectService: SubjectService,
    private fireBaseService: FireBaseService<Question | Option>
  ) {}

  ngOnInit(): void {
    this.subjectId = this.subjectService.getSubjectId() || '';
    if (this.subjectId) {
      console.log('Loaded Subject ID:', this.subjectId);
      this.getAllQuestions();
    } else {
      console.error('No subject ID provided');
      this.toastr.error('Please select a subject first');
    }
  }

  getAllQuestions(): void {
    if (this.subjectId) {
      this.fireBaseService.getAllData(`questions/${this.subjectId}`).subscribe(
        (res: Question[]) => {
          this.questions = res;
          console.log('Fetched Questions:', this.questions);
        },
        (error: Error) => {
          console.error('Error fetching questions:', error);
          this.toastr.error('Error fetching questions');
        }
      );
    } else {
      this.toastr.error('No subject ID is currently selected');
    }
  }

  getOptions(questionId: string): void {
    this.fireBaseService
      .getAllData(`options/${this.subjectId}/${questionId}`)
      .subscribe(
        (res: Option[]) => {
          this.options = res;
          console.log('Fetched Options:', this.options);
          this.toastr.success('Options loaded successfully!');
        },
        (error: Error) => {
          console.error('Error fetching options:', error);
          this.toastr.error('Error fetching options');
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
      questionTime: 60,
      createdOn: Date.now(),
      updatedOn: Date.now(),
    };
    this.isQuestionModalVisible = true;
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
        this.isQuestionModalVisible = false;
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
