import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import evaluationList from '../assets/Evaluation_list_mock.json'
import { ButtonComponent } from '../../common/button/button.component';
import { SearchbarComponent } from '../../common/searchbar/searchbar.component';
import { EvaluationService } from '../service/evaluation.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';


@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [CommonModule ,ButtonComponent,SearchbarComponent],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrl: './evaluation-dashboard.component.css'
})
export class EvaluationDashboardComponent {
  evaluationList: any[] = [];
  filteredEvaluationList: any[] = []; 
  searchQuery: string = ''; 
  constructor(private router: Router,private evaluationService: EvaluationService,private firebaseService:FireBaseService<any>) { }
  navigateToEvaluate(evaluationList:any):void {
  this.evaluationService.setData(evaluationList);
  this.router.navigate(['/evaluate']);
} 
 
  ngOnInit(): void {
    this.evaluationList=evaluationList;
   this.filteredEvaluationList = this.evaluationList;
  }
  onSearchQueryChanged(query: string): void {
    this.searchQuery = query;
  
    // If the query is empty, show all evaluations
    if (query.trim() === '') {
      this.filteredEvaluationList = [...this.evaluationList];
    } else {
      
      this.filteredEvaluationList = this.evaluationList.filter((evaluation) =>
        evaluation.assessmentId.toLowerCase().includes(query.trim().toLowerCase())
      );
    }
  }
  
 
  
 
  

  

}
