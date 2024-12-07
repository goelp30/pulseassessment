import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:"question-display.component.html",
  styleUrl:"question-display.component.css",
})
export class QuestionDisplayComponent {
  @Input() question!: Question;
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<number>();
  @Output() descriptiveAnswerChange = new EventEmitter<string>();
  @Output() reviewToggle = new EventEmitter<void>();

  // Emit selected answer index
  onAnswerSelect(optionIndex: number) {
    this.answerSelect.emit(optionIndex);
  }

  // Emit descriptive answer text
  onDescriptiveAnswerChange(event: Event) {
    const answer = (event.target as HTMLTextAreaElement).value;
    this.descriptiveAnswerChange.emit(answer);
  }

  // TrackBy function for better performance in ngFor
  trackByOption(index: number): number {
    return index;
  }
}
