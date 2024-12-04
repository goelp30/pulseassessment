import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';
import { MultipleChoiceQuestionComponent } from '../multiple-choice-question/multiple-choice-question.component';
import { DescriptiveQuestionComponent } from '../descriptive-question/descriptive-question.component';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, MultipleChoiceQuestionComponent, DescriptiveQuestionComponent],
  template: `
    <div class="bg-gray-50 rounded-lg p-6 mb-6">
      @if (question.questionType === 'descriptive') {
        <app-descriptive-question
          [question]="question"
          [questionNumber]="questionNumber"
          [totalQuestions]="totalQuestions"
          (answerChange)="descriptiveAnswerChange.emit($event)"
          (reviewToggle)="reviewToggle.emit()"
        />
      } @else {
        <app-multiple-choice-question
          [question]="question"
          [questionNumber]="questionNumber"
          [totalQuestions]="totalQuestions"
          (answerSelect)="answerSelect.emit($event)"
          (reviewToggle)="reviewToggle.emit()"
        />
      }
    </div>
  `
})
export class QuestionDisplayComponent {
  @Input() question!: Question;
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<number>();
  @Output() descriptiveAnswerChange = new EventEmitter<string>();
  @Output() reviewToggle = new EventEmitter<void>();
}