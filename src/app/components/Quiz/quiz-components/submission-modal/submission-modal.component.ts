import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-submission-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"submission-modal.component.html",
  styleUrl:"submission-modal.component.css",
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

