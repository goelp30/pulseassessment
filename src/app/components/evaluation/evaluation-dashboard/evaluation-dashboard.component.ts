import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';
import evaluationList from '../assets/Evaluation_list_mock.json'
import { ButtonComponent } from '../../common/button/button.component';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';


@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,

  imports: [CommonModule ,ButtonComponent,SearchbarComponent],

  templateUrl: './evaluation-dashboard.component.html',
  styleUrl: './evaluation-dashboard.component.css'
})
export class EvaluationDashboardComponent {
  EvaluationList: any[] = [];
  filteredEvaluationList: any[] = []; 
  searchQuery: string = '';  
 
  ngOnInit(): void {
   this.EvaluationList=evaluationList;
   this.filteredEvaluationList = this.EvaluationList;
  }
  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
  
    // If the query is empty, show all evaluations
    if (query.trim() === '') {
      this.filteredEvaluationList = [...this.EvaluationList];
    } else {
      
      this.filteredEvaluationList = this.EvaluationList.filter((evaluation) =>
        evaluation.assessmentId.toLowerCase().includes(query.trim().toLowerCase())
      );
    }
  }
  
  constructor(private router: Router) { }
    navigateToEvaluate() {
    this.router.navigate(['/evaluate']);
  }
  

}
