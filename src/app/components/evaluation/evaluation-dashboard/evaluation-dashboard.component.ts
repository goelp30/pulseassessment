import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TableComponent } from '../../common/table/table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../service/evaluation.service';
import { HeaderComponent } from '../../common/header/header.component';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Candidate } from '../../../models/candidate';
import { Employee } from '../../../models/employee';
import { AssessmentData } from '../../../models/AssessmentData';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [TableComponent, CommonModule, FormsModule, HeaderComponent],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrl: './evaluation-dashboard.component.css',
})
export class EvaluationDashboardComponent implements OnInit, OnDestroy {
  evaluationList: any[] = [];
  filteredEvaluationList: any[] = [];
  searchQuery: string = '';
  activeTab: string = 'all';
  tabs: string[] = ['all', 'Completed', 'Pending'];
  currentButtonLabel: string = 'Evaluate';
  filterKey = 'status';
  tableName: string = 'List of Evaluations';
  isLoading: boolean = true;

  columnAliases = {
    userName: ['User Name'],
    userEmail: ['User Email'],
    quizId: ['Quiz Id'],
    status: ['Status'],
  };
  buttons = [
    {
      label: (row: any) => this.getButtonLabel(row),
      colorClass: 'bg-custom-blue text-white py-2 px-4 w-150 rounded-md',
      action: (row: any) => this.handleButtonClick(row),
    },
  ];
  searchPlaceholder = 'Search....';
  // Add properties to store user data
  candidates: Candidate[] = [];
  employees: Employee[] = [];

  private destroy$ = new Subject<void>(); // Subject to manage subscriptions

  constructor(
    private router: Router,
    private evaluationService: EvaluationService,
    private firebaseservice: FireBaseService<AssessmentData>
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe(() => {
        this.fetchData();
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(); // Emit value to complete all subscriptions
    this.destroy$.complete(); // Complete the subject
  }

  fetchData() {
    this.getAssessmentForEvaluation();
    this.getCandidatesAndEmployees();
  }

  getCandidatesAndEmployees(): void {
    // Fetch candidates and employees data
    this.firebaseservice
      .getAllData('candidates')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.candidates = data;
        },
        (error) => {
          console.error('Error fetching candidates:', error);
        }
      );
    this.firebaseservice
      .getAllData('employees')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
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
    if (row.isEvaluated) {
      this.router.navigate([`/view`]);
    } else {
      this.router.navigate([`/evaluate`]);
    }
  }
  getButtonLabel(row: any): string {
    return row.isEvaluated ? 'View' : 'Evaluate';
  }

  getAssessmentForEvaluation(): void {
    this.getCandidatesAndEmployees();
    this.isLoading = true;
    this.firebaseservice
      .getAllData('AssessmentData')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.evaluationList = data;
          this.filteredEvaluationList = [...this.evaluationList];

          // Add the userName, userEmail, and assessmentName to each row
          this.filteredEvaluationList = this.filteredEvaluationList.map(
            (row) => {
              const userId = row.userId;
              let user: Candidate | Employee | undefined;

              // Check if the user is a candidate or employee
              user =
                this.candidates.find(
                  (candidate) => candidate.candidateId === userId
                ) ||
                this.employees.find(
                  (employee) => employee.employeeId === userId
                );

              const updatedRow = {
                ...row,
                userName: user ? this.getUserName(user) : '',
                userEmail: user ? this.getUserEmail(user) : '',
                status: row.isEvaluated ? 'Completed' : 'Pending',
                assessmentName: '', // Placeholder for assessment name
              };

              // Fetch the assessmentName for each row
              this.firebaseservice
                .getAssessmentNameById(row.assessmentID)
                .subscribe(
                  (name) => {
                    updatedRow.assessmentName = name; // Set the actual assessmentName
                  },
                  (error) => {
                    console.error('Error fetching assessment name:', error);
                  }
                );

              return updatedRow;
            }
          );
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching assessments:', error);
          this.isLoading = false;
        }
      );
  }

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
