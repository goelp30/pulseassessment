import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Option, Question } from '../../../../models/question';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-display.component.html',
  styleUrls: ['./question-display.component.css'],
})
export class QuestionDisplayComponent implements OnInit {
  @ViewChildren('radioInput') radioInputs!: QueryList<ElementRef>;
  @ViewChildren('checkboxInput') checkboxInputs!: QueryList<ElementRef>;

  @Input() question!: Question;
  @Input() options: Option[] = [];
  @Input() questionNumber!: number;
  @Input() totalQuestions!: number;
  @Output() answerSelect = new EventEmitter<string>();
  @Output() reviewToggle = new EventEmitter<void>();
  @Output() descriptiveAnswerChange = new EventEmitter<{
    questionId: string;
    answer: string;
  }>();
  @Output() textAreaTouched = new EventEmitter<void>();

  descriptiveAnswers: { [questionId: string]: string } = {};

  ngOnInit() {
    this.clearSavedAnswer();
  }

  clearSavedAnswer(): void {
    const key = `question_${this.question.questionId}`;
    localStorage.removeItem(key);
    this.question.selectedAnswer =
      this.question.questionType === 'Multi' ? [] : null;
    this.descriptiveAnswers[this.question.questionId] = '';
  }

  selectOption(optionId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.question.questionType === 'Single') {
      this.question.selectedAnswer = optionId;
      this.answerSelect.emit(optionId);
    } else if (this.question.questionType === 'Multi') {
      const selectedAnswers = Array.isArray(this.question.selectedAnswer)
        ? [...this.question.selectedAnswer]
        : [];
      const index = selectedAnswers.indexOf(optionId);

      if (index > -1) {
        selectedAnswers.splice(index, 1);
      } else {
        selectedAnswers.push(optionId);
      }

      this.question.selectedAnswer = selectedAnswers;
      this.answerSelect.emit(optionId);
    }
  }

  onReviewToggle(): void {
    this.reviewToggle.emit();
  }

  isOptionSelected(optionId: string): boolean {
    if (this.question.questionType === 'Multi') {
      return (
        Array.isArray(this.question.selectedAnswer) &&
        this.question.selectedAnswer.includes(optionId)
      );
    }
    return this.question.selectedAnswer === optionId;
  }

  onDescriptiveAnswerChange(event: any): void {
    const answer = typeof event === 'string' ? event : event?.target?.value;
    if (answer !== undefined) {
      this.currentDescriptiveAnswer = answer;
    }
  }

  get currentDescriptiveAnswer(): string {
    return this.descriptiveAnswers[this.question.questionId] || '';
  }

  set currentDescriptiveAnswer(value: string) {
    this.descriptiveAnswers[this.question.questionId] = value;
    this.descriptiveAnswerChange.emit({
      questionId: this.question.questionId,
      answer: value,
    });
  }

  onTextAreaFocus(): void {
    this.textAreaTouched.emit();
  }
}
