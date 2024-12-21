import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {
  @Input() question: any;
  @Input() options: any[]=[];
  @Input() userAnswer: any;
  @Input() answer: any;  // For Descriptive answers
  @Input() marks: number=0;
  @Input() assignedMarks: number=0;
  @Input() isDisabled: boolean = false;// Ensure this is defined as an Input
  @Output() marksChanged = new EventEmitter<any>();
onMarksChange(): void {
    this.question.assigned_marks = this.question.assignedMarks;
    this.marksChanged.emit(this.question); // Emit the question when marks change
  }
}
