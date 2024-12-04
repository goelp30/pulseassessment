import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-quiz-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-6 bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Quiz Progress</h2>
      
      <div class="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div class="flex rounded-full h-4">
          <div 
            class="bg-emerald-500 rounded-l-full"
            [style.width.%]="(attemptedCount / totalQuestions) * 100">
          </div>
          <div 
            class="bg-yellow-400"
            [style.width.%]="(markedForReviewCount / totalQuestions) * 100">
          </div>
          <div 
            class="bg-red-400 rounded-r-full"
            [style.width.%]="(notAttemptedCount / totalQuestions) * 100">
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-emerald-50 rounded-lg p-4 text-center">
          <h3 class="text-emerald-800 font-medium">Attempted</h3>
          <p class="text-3xl font-bold text-emerald-600">{{ attemptedCount }}</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 text-center">
          <h3 class="text-yellow-800 font-medium">Marked for Review</h3>
          <p class="text-3xl font-bold text-yellow-600">{{ markedForReviewCount }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 text-center">
          <h3 class="text-red-800 font-medium">Not Attempted</h3>
          <p class="text-3xl font-bold text-red-600">{{ notAttemptedCount }}</p>
        </div>
      </div>

      <div class="flex justify-between">
        <button 
          (click)="reviewMarked.emit()"
          class="btn btn-warning"
          [disabled]="markedForReviewCount === 0">
          Review Marked Questions
        </button>
        <button 
          (click)="submit.emit()"
          class="btn btn-success"
          [disabled]="!canSubmit">
          Submit Quiz
        </button>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      @apply px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .btn-warning {
      @apply bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500;
    }
    .btn-success {
      @apply bg-green-500 text-white hover:bg-green-600 focus:ring-green-500;
    }
  `]
})
export class QuizProgressComponent {
  @Input() questions: Question[] = [];
  @Input() attemptedCount = 0;
  @Input() markedForReviewCount = 0;
  @Input() notAttemptedCount = 0;
  @Input() canSubmit = false;
  @Output() reviewMarked = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  get totalQuestions(): number {
    return this.questions.length;
  }
}