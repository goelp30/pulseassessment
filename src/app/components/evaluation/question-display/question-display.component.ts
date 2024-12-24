import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SentenceCasePipe } from '../service/sentence-case.pipe';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [FormsModule, CommonModule, NgClass, SentenceCasePipe],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css',
})
export class QuestionDisplayComponent {
  @Input() question: any;
  @Input() options: any[] = [];
  @Input() userAnswer: any;
  @Input() answer: any; 
  @Input() marks: number = 0;
  @Input() assignedMarks: number = 0;
  @Input() isDisabled: boolean = false; 
  @Output() marksChanged = new EventEmitter<any>();
  isCopied: boolean = false;
  showMarksError :boolean=false;  

  onMarksChange(): void {
    this.question.assigned_marks = this.question.assignedMarks;
    this.showMarksError=this.question.assignedMarks > this.question. questionWeightage;
    this.marksChanged.emit([this.question,this.showMarksError]);
  }
  getOptionClass(question: any, option: any): string {
    // Check if the option ID exists in the userAnswer array
    const isUserAnswerSelected = question.userAnswer && question.userAnswer.includes(option.optionId);
    if (isUserAnswerSelected) {
      return option.isCorrectOption ? 'text-green-600' : 'text-red-600';
    }
    if (question.userAnswer === undefined && option.isCorrectOption) {
      return 'text-yellow-600';
    }
    if (question.userAnswer !== undefined && !isUserAnswerSelected && option.isCorrectOption) {
      return 'text-yellow-600';
    }
   if (question.userAnswer !== undefined && !isUserAnswerSelected && !option.isCorrectOption) {
      return 'text-gray-600';
    }
  return '';  // Default case if no conditions are met
  }
  
}
