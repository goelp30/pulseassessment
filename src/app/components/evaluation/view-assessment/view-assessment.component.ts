import { Component } from '@angular/core';
<<<<<<< Updated upstream
=======
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';
>>>>>>> Stashed changes

@Component({
  selector: 'app-view-assessment',
  standalone: true,
<<<<<<< Updated upstream
  imports: [],
=======
  imports: [ButtonComponent,CommonModule],
>>>>>>> Stashed changes
  templateUrl: './view-assessment.component.html',
  styleUrl: './view-assessment.component.css'
})
export class ViewAssessmentComponent {

}
<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
