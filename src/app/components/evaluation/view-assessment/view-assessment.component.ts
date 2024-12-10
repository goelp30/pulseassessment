import { Component } from '@angular/core';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [ButtonComponent,CommonModule],
  templateUrl: './view-assessment.component.html',
  styleUrl: './view-assessment.component.css'
})
export class ViewAssessmentComponent {

 clickedData:any;
  constructor(private evaluationService: EvaluationService,private router:Router){}
  ngOnInit(): void {
  this.clickedData = this.evaluationService.getData();
  console.log(this.clickedData);
}
getTotalMarks(): number {
  // Calculate the total max marks for all questions
  let totalMarks = 0;
  this.clickedData.questions.forEach((question: any) => {
    totalMarks += question.totalMarks; // Add up totalMarks from all questions
  });
  return totalMarks;
}
onSubmit(){
this.router.navigate(['/evaluation']);

}}

