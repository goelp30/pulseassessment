import { Component } from '@angular/core';
import { QuestionsComponent } from '../commonEvaluationComponent/questions/questions.component';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [QuestionsComponent],
  templateUrl: './view-assessment.component.html',
  styleUrl: './view-assessment.component.css'
})
export class ViewAssessmentComponent {
  

}
