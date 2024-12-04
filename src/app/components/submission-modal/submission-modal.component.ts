import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-submission-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <h2 class="text-2xl font-bold mb-6">Before Quiz Submission</h2>
          
          <div class="mb-6">
            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div class="flex h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-emerald-500"
                  [style.width.%]="(getAttemptedCount() / questions.length) * 100">
                </div>
                <div 
                  class="bg-yellow-400"
                  [style.width.%]="(getMarkedForReviewCount() / questions.length) * 100">
                </div>
                <div 
                  class="bg-red-400"
                  [style.width.%]="(getNotAttemptedCount() / questions.length) * 100">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-emerald-50 rounded-lg p-4 text-center">
                <h3 class="text-emerald-800 font-medium">Attempted</h3>
                <p class="text-3xl font-bold text-emerald-600">{{ getAttemptedCount() }}</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4 text-center">
                <h3 class="text-yellow-800 font-medium">Marked for Review</h3>
                <p class="text-3xl font-bold text-yellow-600">{{ getMarkedForReviewCount() }}</p>
              </div>
              <div class="bg-red-50 rounded-lg p-4 text-center">
                <h3 class="text-red-800 font-medium">Not Attempted</h3>
                <p class="text-3xl font-bold text-red-600">{{ getNotAttemptedCount() }}</p>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end gap-4">
            <button 
              (click)="onCancel.emit()"
              class="px-4 py-2 text-gray-600 hover:text-gray-800">
              Continue Quiz
            </button>
            <button 
              (click)="onConfirm.emit()"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class SubmissionModalComponent {
  @Input() show = false;
  @Input() questions: Question[] = [];
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  getAttemptedCount(): number {
    return this.questions.filter(q => 
      q.selectedAnswer !== undefined || 
      (q.questionType === 'descriptive' && !!q.descriptiveAnswer?.trim())
    ).length;
  }

  getMarkedForReviewCount(): number {
    return this.questions.filter(q => q.isMarkedForReview).length;
  }

  getNotAttemptedCount(): number {
    return this.questions.length - this.getAttemptedCount();
  }
}