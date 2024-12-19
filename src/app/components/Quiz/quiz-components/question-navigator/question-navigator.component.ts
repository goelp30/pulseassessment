import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../../models/question';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "question-navigator.component.html",
})
export class QuestionNavigatorComponent {
  @Input() questions: Question[] = [];
  @Input() currentQuestionIndex = 0;
  @Output() questionSelect = new EventEmitter<number>();

  onQuestionSelect(index: number) {
    this.questionSelect.emit(index); // Emit the selected question index
  }

  getButtonClass(index: number): string {
    const question = this.questions[index];

    // If the current question is selected, highlight it as active
    if (index === this.currentQuestionIndex) {
      return 'bg-blue-500 text-white';
    }
    // If the question is marked for review, highlight it
    if (question.isMarkedForReview) {
      return 'bg-yellow-400 text-white';
    }
    // If the question has a selected answer, highlight it as answered
    if (question.selectedAnswer !== undefined) {
      return 'bg-green-500 text-white';
    }
    // If the question is visited but unanswered, apply visited style
    if (question.isVisited) {
      return 'bg-gray-300';
    }
    // Default style for unvisited/unanswered questions
    return 'bg-gray-500 text-white';
  }
}
