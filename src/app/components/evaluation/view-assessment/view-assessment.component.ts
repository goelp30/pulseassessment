import { Component } from '@angular/core';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../common/button/button.component';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [ButtonComponent],
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
onSubmit(){
this.router.navigate(['/evaluation']);

}}
