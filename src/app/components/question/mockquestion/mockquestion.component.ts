import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Question } from '../../../models/question';
import { TableNames } from '../../../enums/TableName';
import { HeaderComponent } from '../../common/header/header.component';
import { TableComponent } from '../../common/table/table.component';
import { SubjectService } from '../../../../sharedServices/Subject.service';

@Component({
  selector: 'app-mockquestion',
  standalone: true,
  imports: [HeaderComponent, TableComponent],
  templateUrl: './mockquestion.component.html',
  styleUrls: ['./mockquestion.component.css'],
})
export class MockquestionComponent implements OnInit {
  deleteQuestion(row: Question) {
    console.log('Delete action not implemented', row);
  }

  editQuestion(row: Question) {
    console.log('Edit action not implemented', row);
  }

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

  questions: Question[] = [];
  tableColumns: (keyof Question)[] = [
    'questionText',
  ];
  columnAliases: { [key: string]: string[] } = {
    questionText: ['Question Text'],
  };
  tableName: string = TableNames.Question;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isAddModal: boolean = false;
  selectedQuestion: Question | null = null;
  subjectId: string = '';
  searchPlaceholder:string='Search Questions'

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    // Simulate subjectId selection logic
    this.subjectId = this.subjectService.getSubjectId() || 'default';
    console.log('Loaded Subject ID:', this.subjectId);

    // Load mock data directly instead of fetching from Firebase
    this.loadMockQuestions();
  }

  loadMockQuestions(): void {
    this.questions = [
      {
        subjectId: 'angular_001',
        questionId: 1,
        questionText: 'What is Angular CLI used for?',
        questionType: 'MCQ',
        questionLevel: 'Easy',
        questionWeightage: 5,
        questionTime: 30,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_002',
        questionId: 2,
        questionText: 'Which decorator is used to define an Angular module?',
        questionType: 'MCQ',
        questionLevel: 'Easy',
        questionWeightage: 4,
        questionTime: 20,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_003',
        questionId: 3,
        questionText: 'What is RxJS in Angular?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeightage: 6,
        questionTime: 40,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_004',
        questionId: 4,
        questionText: 'How do you bind a component property in Angular?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeightage: 5,
        questionTime: 30,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_005',
        questionId: 5,
        questionText: 'What is the purpose of the `@Injectable()` decorator?',
        questionType: 'MCQ',
        questionLevel: 'Hard',
        questionWeightage: 7,
        questionTime: 45,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_006',
        questionId: 6,
        questionText: 'Which lifecycle hook is called after a component’s view has been initialized?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeightage: 6,
        questionTime: 30,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_007',
        questionId: 7,
        questionText: 'What is a Subject in RxJS?',
        questionType: 'MCQ',
        questionLevel: 'Hard',
        questionWeightage: 8,
        questionTime: 45,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        subjectId: 'angular_008',
        questionId: 8,
        questionText: 'Which operator is commonly used for HTTP calls in Angular?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeightage: 6,
        questionTime: 40,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
    ];
    console.log('Mock Questions Loaded:', this.questions);
  }
  

  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
}
