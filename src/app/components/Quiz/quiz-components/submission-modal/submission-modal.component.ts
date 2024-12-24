import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../../models/question';

@Component({
  selector: 'app-submission-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'submission-modal.component.html',
  styleUrl: 'submission-modal.component.css',
})
export class SubmissionModalComponent {
  @Input() show = false;
  @Input() questions: Question[] = [];
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  getAttemptedCount(): number {
    return this.questions.reduce((count, question) => {
      // Check if question is attempted based on type
      if (question.questionType === 'Descriptive') {
        // Count descriptive questions with non-empty answers
        return question.descriptiveAnswer?.trim() ? count + 1 : count;
      } else {
        // For MCQ/Single choice, check selectedAnswer
        return question.selectedAnswer &&
          (Array.isArray(question.selectedAnswer)
            ? question.selectedAnswer.length > 0
            : question.selectedAnswer !== null)
          ? count + 1
          : count;
      }
    }, 0);
  }

  getMarkedForReviewCount(): number {
    return this.questions.filter((q) => q.isMarkedForReview).length;
  }

  getNotAttemptedCount(): number {
    return this.questions.length - this.getAttemptedCount();
  }

  cancel() {
    this.onCancel.emit();
  }

  confirm() {
    this.onConfirm.emit();
  }
}
