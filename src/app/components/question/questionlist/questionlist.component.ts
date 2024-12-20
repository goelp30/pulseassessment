import { Component } from '@angular/core';
import { QuestiontableComponent } from '../questiontable/questiontable.component';

@Component({
  selector: 'app-questionlist',
  standalone: true,
  imports: [QuestiontableComponent],
  templateUrl: './questionlist.component.html',
  styleUrl: './questionlist.component.css'
})
export class QuestionlistComponent {
  showQuestionTable: boolean = false; // Control the visibility of QuestionTable

  toggleQuestionTable() {
    this.showQuestionTable = !this.showQuestionTable;
  }
}