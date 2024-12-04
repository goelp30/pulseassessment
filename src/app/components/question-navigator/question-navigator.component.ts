import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-4">
      <h2 class="text-lg font-semibold mb-4">Question Navigator</h2>
      <div class="grid grid-cols-4 gap-2">
        @for (question of questions; track question.id; let i = $index) {
          <button 
            (click)="onQuestionSelect(i)"
            class="w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            [class]="getButtonClass(i)"
            [disabled]="!isNavigable(i)">
            {{ i + 1 }}
          </button>
        }
      </div>

      <div class="mt-6 space-y-2">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-emerald-500 rounded"></div>
          <span class="text-sm">Not Visited</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm">Current Question</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-yellow-400 rounded"></div>
          <span class="text-sm">Marked for Review</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-100 rounded"></div>
          <span class="text-sm">Answered</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-gray-200 rounded"></div>
          <span class="text-sm">Visited</span>
        </div>
      </div>
    </div>
  `
})
export class QuestionNavigatorComponent {
  @Input() questions: Question[] = [];
  @Input() currentQuestionIndex = 0;
  @Output() questionSelect = new EventEmitter<number>();

  onQuestionSelect(index: number) {
    if (this.isNavigable(index)) {
      this.questionSelect.emit(index);
    }
  }

  isNavigable(index: number): boolean {
    return this.questions[index].selectedAnswer !== undefined || 
           this.questions[index].isVisited;
  }

  getButtonClass(index: number): string {
    const question = this.questions[index];
    const baseClass = 'transition-colors';

    if (index === this.currentQuestionIndex) {
      return `${baseClass} bg-blue-500 text-white`;
    }
    if (question.isMarkedForReview) {
      return `${baseClass} bg-yellow-400 text-white`;
    }
    if (question.selectedAnswer !== undefined) {
      return `${baseClass} bg-green-100`;
    }
    if (question.isVisited) {
      return `${baseClass} bg-gray-200`;
    }
    return `${baseClass} bg-emerald-500 text-white`;
  }
}