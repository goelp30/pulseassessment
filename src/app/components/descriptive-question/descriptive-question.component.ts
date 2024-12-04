import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-descriptive-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-start">
        <h2 class="text-xl font-semibold">
          <span class="text-gray-600 mr-2">Question {{ questionNumber }} of {{ totalQuestions }}:</span>
          {{ question.text }}
        </h2>
        <button 
          (click)="reviewToggle.emit()"
          class="ml-4 px-4 py-2 text-white shadow text-sm focus:outline-none focus:ring focus:ring-purple-100 rounded-full transition-colors"
          [class.bg-yellow-400]="question.isMarkedForReview"
          [class.bg-purple-300]="!question.isMarkedForReview">
          {{ question.isMarkedForReview ? 'Marked for Review' : 'Mark for Review' }}
        </button>
      </div>
      <textarea
        [value]="question.descriptiveAnswer || ''"
        (input)="onAnswerChange($event)"
        rows="6"
        class="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Type your answer here...">
      </textarea>
    </div>
  `
})
export class DescriptiveQuestionComponent {
  @Input() question!: Question;
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerChange = new EventEmitter<string>();
  @Output() reviewToggle = new EventEmitter<void>();

  onAnswerChange(event: Event) {
    const answer = (event.target as HTMLTextAreaElement).value;
    this.answerChange.emit(answer);
  }
}