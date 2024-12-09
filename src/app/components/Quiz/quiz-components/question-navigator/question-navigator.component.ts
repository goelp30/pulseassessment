import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"question-navigator.component.html",
  styleUrl:"question-navigator.component.css",
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
      return `${baseClass}  bg-emerald-500`;
    }
    if (question.isVisited) {
      return `${baseClass} bg-emerald-500`;
    }
    return `${baseClass} bg-gray-500 text-white`;
  }
}

