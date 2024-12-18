import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../../models/question';

@Component({
  selector: 'app-submission-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "submission-modal.component.html",
  styleUrl: "submission-modal.component.css",
})
export class SubmissionModalComponent {
  @Input() show = false;
  @Input() questions: Question[] = [];
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  // Method to count attempted questions
  getAttemptedCount(): number {
    return this.questions.filter(q => 
      q.selectedAnswer !== undefined || 
      (q.questionType === 'descriptive' && !!q.descriptiveAnswer?.trim())
    ).length;
  }

  // Method to count marked questions for review
  getMarkedForReviewCount(): number {
    return this.questions.filter(q => q.isMarkedForReview).length;
  }

  // Method to count unanswered questions
  getNotAttemptedCount(): number {
    return this.questions.filter(q => 
      q.selectedAnswer === undefined && 
      (q.questionType !== 'descriptive' || !q.descriptiveAnswer?.trim()) &&
      !q.isMarkedForReview
    ).length;
  }

  // Method to check if all questions have been attempted
  isSubmitDisabled(): boolean {
    return this.getAttemptedCount() !== this.questions.length;
  }
}
