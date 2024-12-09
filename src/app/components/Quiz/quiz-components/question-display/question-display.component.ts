import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'question-display.component.html',
  styleUrls: ['question-display.component.css'],
})
export class QuestionDisplayComponent {
isChecked(_t27: number) {
throw new Error('Method not implemented.');
}
  @Input() question!: Question;
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<number>(); // For single-choice answers
  @Output() descriptiveAnswerChange = new EventEmitter<string>(); // For descriptive answers
  @Output() reviewToggle = new EventEmitter<void>(); // For toggle review action
  @Output() multiAnswerSelect = new EventEmitter<number[]>(); // For multi-answer selections

  // Emit selected answer index (for single choice)
  onAnswerSelect(optionIndex: number): void {
    this.answerSelect.emit(optionIndex);
  }

  // Emit selected answers for multi-check (update selectedAnswer array)
  toggleMultiAnswerSelection(optionIndex: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    // Ensure selectedAnswer is an array
    let selectedAnswer = Array.isArray(this.question.selectedAnswer)
      ? [...this.question.selectedAnswer] // Copy the array to maintain immutability
      : this.question.selectedAnswer != null
      ? [this.question.selectedAnswer]
      : [];

    // Add or remove optionIndex from the selectedAnswer array
    if (isChecked) {
      if (!selectedAnswer.includes(optionIndex)) {
        selectedAnswer.push(optionIndex); // Add optionIndex if not already selected
      }
    } else {
      selectedAnswer = selectedAnswer.filter((index: number) => index !== optionIndex); // Remove optionIndex if unchecked
    }

    // Update the selectedAnswer and emit the updated array
    this.question.selectedAnswer = selectedAnswer;
    this.multiAnswerSelect.emit([...selectedAnswer]); // Emit updated array of selected answers
  }

  // Emit descriptive answer text (for open-ended answers)
  onDescriptiveAnswerChange(event: Event): void {
    const answer = (event.target as HTMLTextAreaElement).value;
    this.descriptiveAnswerChange.emit(answer);
  }

  // Emit review toggle (for marking questions for review)
  toggleReview(): void {
    this.reviewToggle.emit();
  }

  // trackBy function to optimize ngFor rendering (for options)
  trackByOption(index: number): number {
    return index; // Returning index to optimize list rendering in ngFor
  }
}
