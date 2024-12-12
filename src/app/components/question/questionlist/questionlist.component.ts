import { Component } from '@angular/core';
import { MockquestionComponent } from '../mockquestion/mockquestion.component';

@Component({
  selector: 'app-questionlist',
  standalone: true,
  imports: [MockquestionComponent],
  templateUrl: './questionlist.component.html',
  styleUrl: './questionlist.component.css'
})
export class QuestionlistComponent {
  showQuestionTable: boolean = false; // Control the visibility of QuestionTable

  toggleQuestionTable() {
    this.showQuestionTable = !this.showQuestionTable;
  }
}