import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableComponent } from '../../common/table/table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../service/evaluation.service';
import { HeaderComponent } from '../../common/header/header.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Candidate } from '../../../models/candidate';
import { Employee } from '../../../models/employee';
import { AssessmentData } from '../../../models/AssessmentData';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [TableComponent, CommonModule, FormsModule, HeaderComponent],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrls: ['./evaluation-dashboard.component.css'],
})
export class EvaluationDashboardComponent implements OnInit {
  evaluationList: any[] = [];
  filteredEvaluationList: any[] = [];
  searchQuery: string = '';
  activeTab: string = 'all';
  tabs: string[] = ['all', 'Completed', 'Pending'];
  currentButtonLabel: string = 'Evaluate';
  filterKey = 'status';
  tableName: string = 'List of Evaluations';

  columnAliases = {
    userName: ['User Name'],
    userEmail: ['User Email'],
    quizId: ['Quiz Id'],
    status: ['Status'],
  };
  buttons = [
    {
      label: this.currentButtonLabel,
      colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md',
      action: (row: any) => this.handleButtonClick(row),
    },
  ];
  searchPlaceholder = 'Search here....';
  // Add properties to store user data
  candidates: Candidate[] = [];
  employees: Employee[] = [];

  constructor(
    private router: Router,
    private evaluationService: EvaluationService,
    private firebaseservice: FireBaseService<AssessmentData>
  ) {}

  ngOnInit(): void {
    this.getAssessmentForEvaluation();
    this.getCandidatesAndEmployees();
  }

  getCandidatesAndEmployees(): void {
    // Fetch candidates and employees data
    this.firebaseservice.getAllData('candidates').subscribe(
      (data) => {
        this.candidates = data;
      },
      (error) => {
        console.error('Error fetching candidates:', error);
      }
    );
    this.firebaseservice.getAllData('employees').subscribe(
      (data) => {
        this.employees = data;
      },
      (error) => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  // Whenever the search query changes, update the data in the table
  onSearchQueryChange(newQuery: string): void {
    this.searchQuery = newQuery;
  }

  handleButtonClick(row: any): void {
    this.evaluationService.setData(row);
    this.evaluationService.setQuizId(row.quizId);
    if (row.isEvaluated) {
      this.router.navigate([`/view`]);
      this.currentButtonLabel = 'View'; // Update the label dynamically
    } else {
      this.router.navigate([`/evaluate`]);
      this.currentButtonLabel = 'Evaluate'; // Update the label dynamically
    }
  }
  getButtonLabel(row: any): string {
    return row.isEvaluated ? 'View' : 'Evaluate';
  }

  getAssessmentForEvaluation(): void {
    this.getCandidatesAndEmployees();
    this.firebaseservice.getAllData('AssessmentData').subscribe(
      (data) => {
        this.evaluationList = data;
        this.filteredEvaluationList = [...this.evaluationList];

        // Add the userName and userEmail to each row
        this.filteredEvaluationList = this.filteredEvaluationList.map((row) => {
          const userId = row.userId;
          let user: Candidate | Employee | undefined;

          // Check if the user is a candidate or employee
          user =
            this.candidates.find(
              (candidate) => candidate.candidateId === userId
            ) ||
            this.employees.find((employee) => employee.employeeId === userId);

          const updatedRow = {
            ...row,
            userName: user ? this.getUserName(user) : '',
            userEmail: user ? this.getUserEmail(user) : '',
            status: row.isEvaluated ? 'Completed' : 'Pending',
          };
          return updatedRow;
        });
      },
      (error) => {
        console.error('Error fetching assessments:', error);
      }
    );
  }

  // Type guard for Candidate
  isCandidate(user: Candidate | Employee): user is Candidate {
    return (user as Candidate).candidateId !== undefined;
  }

  // Type guard for Employee
  isEmployee(user: Candidate | Employee): user is Employee {
    return (user as Employee).employeeId !== undefined;
  }

  // Function to get the user name
  getUserName(user: Candidate | Employee): string {
    if (this.isCandidate(user)) {
      return user.candidateName || '';
    }
    if (this.isEmployee(user)) {
      return user.employeeName || '';
    }
    return '';
  }

  // Function to get the user email
  getUserEmail(user: Candidate | Employee): string {
    if (this.isCandidate(user)) {
      return user.candidateEmail || '';
    }
    if (this.isEmployee(user)) {
      return user.employeeEmail || '';
    }
    return '';
  }
}
