import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Option, Question } from '../../../../models/question';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-display.component.html',
  styleUrls: ['./question-display.component.css']
})
export class QuestionDisplayComponent {

onDescriptiveAnswerChange($event: string) {
  this.answerSelect.emit($event);
}
  @Input() question!: Question;
  @Input() options: Option[] = [];
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<string>();
  @Output() reviewToggle = new EventEmitter<void>();

  onAnswerSelect(optionId: string): void {
    this.answerSelect.emit(String(optionId));
  }

  onReviewToggle(): void {
    this.reviewToggle.emit();
  }

  isOptionSelected(optionId: string): boolean {
    if (Array.isArray(this.question.selectedAnswer)) {
      return this.question.selectedAnswer.includes(Number(optionId));
    }
    return this.question.selectedAnswer === Number(optionId);
  }
  
}