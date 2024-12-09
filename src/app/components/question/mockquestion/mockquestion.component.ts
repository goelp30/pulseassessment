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

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    // Simulate subjectId selection logic
    this.subjectId = this.subjectService.getSubjectId() || 'default';
    console.log('Loaded Mock Subject ID:', this.subjectId);

    // Load mock data directly instead of fetching from Firebase
    this.loadMockQuestions();
  }

  loadMockQuestions(): void {
    // Mock data corresponding to the Question type
    this.questions = [
      {
        Subjectid: 'angular_001',
        questionId: 1,
        questionText: 'What is Angular CLI used for?',
        questionType: 'MCQ',
        questionLevel: 'Easy',
        questionWeitage: '5',
        answer: ['To initialize, develop, and maintain Angular applications'],
        option: [
          'To style CSS files',
          'To initialize, develop, and maintain Angular applications',
          'To set up database connections',
          'To compile JavaScript',
        ],
        questionTime: '30s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_002',
        questionId: 2,
        questionText: 'Which decorator is used to define an Angular module?',
        questionType: 'MCQ',
        questionLevel: 'Easy',
        questionWeitage: '4',
        answer: ['@NgModule'],
        option: ['@Component', '@Injectable', '@NgModule', '@Directive'],
        questionTime: '20s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_003',
        questionId: 3,
        questionText: 'What is RxJS in Angular?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeitage: '6',
        answer: ['A library for reactive programming using Observables'],
        option: [
          'A styling library for Angular components',
          'A library for reactive programming using Observables',
          'A testing framework for Angular applications',
          'A component routing mechanism',
        ],
        questionTime: '40s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_004',
        questionId: 4,
        questionText: 'How do you bind a component property in Angular?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeitage: '5',
        answer: ['Using property binding with [property]="value" syntax'],
        option: [
          'Using event binding with (click)="value"',
          'Using property binding with [property]="value" syntax',
          'Using string interpolation with {{value}}',
          'Using both CSS and property binding',
        ],
        questionTime: '30s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_005',
        questionId: 5,
        questionText: 'What is the purpose of the `@Injectable()` decorator?',
        questionType: 'MCQ',
        questionLevel: 'Hard',
        questionWeitage: '7',
        answer: ['To define a service that can be injected into components'],
        option: [
          'To define a service that can be injected into components',
          'To set up the routing paths',
          'To make a component a singleton instance',
          'To style a specific Angular component',
        ],
        questionTime: '45s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_006',
        questionId: 6,
        questionText: 'Which lifecycle hook is called ?',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeitage: '6',
        answer: ['ngAfterViewInit'],
        option: ['ngOnInit', 'ngAfterViewInit', 'ngAfterContentInit', 'ngOnChanges'],
        questionTime: '30s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_007',
        questionId: 7,
        questionText: 'What is a Subject in RxJS?',
        questionType: 'MCQ',
        questionLevel: 'Hard',
        questionWeitage: '8',
        answer: ['An observable that can multicast values to multiple subscribers'],
        option: [
          'An observable that can multicast values to multiple subscribers',
          'A function to map observables',
          'A lifecycle hook in RxJS',
          'A decorator in Angular',
        ],
        questionTime: '45s',
        createdOn: Date.now(),
        updatedOn: Date.now(),
      },
      {
        Subjectid: 'angular_008',
        questionId: 8,
        questionText: 'Which operator is commonly used for HTTP ',
        questionType: 'MCQ',
        questionLevel: 'Medium',
        questionWeitage: '6',
        answer: ['HttpClient'],
        option: ['HttpClient', 'Observable', 'Subject', 'BehaviorSubject'],
        questionTime: '40s',
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
