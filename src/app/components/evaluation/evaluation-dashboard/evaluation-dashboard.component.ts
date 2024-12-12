import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TableComponent } from '../../common/table/table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import evaluationList from '../assets/Evaluation_list_mock.json';  
import { EvaluationService } from '../service/evaluation.service';
import { HeaderComponent } from '../../common/header/header.component';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [TableComponent, CommonModule, FormsModule,HeaderComponent],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrls: ['./evaluation-dashboard.component.css']
})

export class EvaluationDashboardComponent implements OnInit {
  evaluationList: any[] = [];  // List of all evaluations
  filteredEvaluationList: any[] = [];  // List of evaluations after filtering
  searchQuery: string = ''; // Search query input from the user
  activeTab: string = 'all'; // Default active tab
  tabs: string[] = ['all', 'Complete', 'Pending']; // Example tabs for filtering
  
  filterKey = 'status'; // Filter by 'status' field (Complete or Pending)
  tableName:string='List of Evaluations';
  
  columnAliases = {
    'assessmentId': ['Assessment ID'],
    'status': ['Status'],
  };

  buttons = [
    { label: 'Evaluate', colorClass: 'bg-blue-500 py-2 px-4 text-white rounded-md', action: (row: any) => this.navigateToEvaluate(row) },
  ];

  searchPlaceholder = 'Search By Assessment ID';

  constructor(
    private router: Router,
    private evaluationService: EvaluationService,
    
  ) {}

  ngOnInit(): void {
    this.evaluationList = evaluationList; // Load mock data
    this.filteredEvaluationList = [...this.evaluationList]; // Initialize filtered list with all evaluations
   }
 onSearchQueryChange(newQuery: string): void {
   this.searchQuery = newQuery;
    ;  
  }
  getButtonLabel(row: any): string {
    return row.status === 'Complete' ? 'View Complete' : 'View Pending';
  }

 navigateToEvaluate(evalList: any): void {
    this.evaluationService.setData(evalList);
  if (!evalList.isEvaluation || !evalList.isAutoEvaluate) {
      this.router.navigate(['/evaluate']);
    } else if (evalList.isEvaluation || evalList.isAutoEvaluate) {
      this.router.navigate(['/view']);
    }
  }
}

