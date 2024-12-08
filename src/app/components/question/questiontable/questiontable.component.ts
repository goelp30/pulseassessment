import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Question } from '../../../models/question';
import { TableNames } from '../../../enums/TableName';
import { HeaderComponent } from '../../common/header/header.component';
import { TableComponent } from '../../common/table/table.component';
import { SubjectService } from '../../../../sharedServices/Subject.service';
@Component({
  selector: 'app-questiontable',
  standalone: true,
  imports: [HeaderComponent, TableComponent],
  templateUrl: './questiontable.component.html',
  styleUrls: ['./questiontable.component.css'],
})
export class QuestionTableComponent implements OnInit {
  deleteQuestion(row: Question) {
    throw new Error('Method not implemented.');
  }
  editQuestion(row: Question) {
    throw new Error('Method not implemented.');
  }
  // Data properties
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
  questionTexts: string[] = [];
  tableColumns: (keyof Question)[] = ['questionText'];
  columnAliases: { [key: string]: string[] } = {
    questionText: ['Question Text'],
  };
  tableName: string = TableNames.Question;
  searchQuery: string = '';
  isModalVisible: boolean = false;
  isAddModal: boolean = false;
  selectedQuestion: Question | null = null;
  subjectId: string = '';

  // Dependency injection
  constructor(
    private fireBaseService: FireBaseService<Question>,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    // Retrieve subjectId from the SubjectService
    this.subjectId = this.subjectService.getSubjectId() || '';
    if (this.subjectId) {
      console.log('Loaded Subject ID:', this.subjectId);
      // Fetch questions for this subject
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
        (error) => {
          console.error('Error fetching questions:', error);
          this.toastr.error('Error fetching questions');
        }
      );
    }
  }


  // Handle search
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
}