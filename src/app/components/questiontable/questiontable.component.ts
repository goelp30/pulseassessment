import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { Question } from '../../models/question';
import { TableNames } from '../../enums/TableName';
import { HeaderComponent } from '../common/header/header.component';
import { TableComponent } from '../common/table/table.component';
import { SubjectService } from '../../../sharedServices/Subject.service';

@Component({
  selector: 'app-questiontable',
  standalone: true,
  imports: [HeaderComponent, TableComponent],
  templateUrl: './questiontable.component.html',
  styleUrls: ['./questiontable.component.css'],
})
export class QuestionTableComponent implements OnInit {
  // Data properties
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
    this.subjectId = this.subjectService.getSubjectId() || '';
    if (this.subjectId) {
      console.log('Loaded Subject ID:', this.subjectId);
    } else {
      console.error('No subject ID provided');
      this.toastr.error('Please select a subject first');
    }
  }



  // Handle search
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }
}
