import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-multiple-choice-question',
  standalone: true,
  imports: [CommonModule],
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
      <div class="space-y-2">
        @for (option of question.options; track option; let i = $index) {
          <div 
            (click)="onAnswerSelect(i)"
            class="flex items-center p-4 bg-white rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors"
            [class.border-blue-500]="question.selectedAnswer === i"
            [class.bg-blue-50]="question.selectedAnswer === i">
            <input 
              type="radio" 
              [id]="'option' + i" 
              [name]="'question' + question.id" 
              [value]="i" 
              [checked]="question.selectedAnswer === i"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500">
            <label [for]="'option' + i" class="ml-3 cursor-pointer">{{ option }}</label>
          </div>
        }
      </div>
    </div>
  `
})
export class MultipleChoiceQuestionComponent {
  @Input() question!: Question;
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<number>();
  @Output() reviewToggle = new EventEmitter<void>();

  onAnswerSelect(optionIndex: number) {
    this.answerSelect.emit(optionIndex);
  }
}