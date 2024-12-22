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
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
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
  @Output() descriptiveAnswerChange = new EventEmitter<string>();

  descriptiveAnswer: string = '';

  answerType: 'code' | 'text' = 'text'; // Default to text

  editorOptions = {
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: true,
    cursorStyle: 'line',
    padding: { top: 10 },
  };

  languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
  ];

  selectedLanguage = 'javascript';

  ngOnInit() {
    this.clearSavedAnswer();
  }

  clearSavedAnswer(): void {
    const key = `question_${this.question.questionId}`;
    localStorage.removeItem(key);
    this.question.selectedAnswer =
      this.question.questionType === 'Multi' ? [] : null;
    this.descriptiveAnswer = '';
  }

  selectOption(optionId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.question.questionType === 'Single') {
      this.question.selectedAnswer = optionId;
    } else if (this.question.questionType === 'Multi') {
      const selectedAnswers = this.question.selectedAnswer || [];
      const index = selectedAnswers.indexOf(optionId);
      if (index > -1) {
        selectedAnswers.splice(index, 1);
      } else {
        selectedAnswers.push(optionId);
      }
      this.question.selectedAnswer = selectedAnswers;
    }
    this.answerSelect.emit(optionId);
  }

  onReviewToggle(): void {
    this.reviewToggle.emit();
  }

  isOptionSelected(optionId: string): boolean {
    if (Array.isArray(this.question.selectedAnswer)) {
      return this.question.selectedAnswer.includes(optionId);
    }
    return this.question.selectedAnswer === optionId;
  }

  onDescriptiveAnswerChange(event: any): void {
    if (typeof event === 'string') {
      this.descriptiveAnswer = event;
      this.descriptiveAnswerChange.emit(event);
    } else if (event?.target?.value !== undefined) {
      this.descriptiveAnswer = event.target.value;
      this.descriptiveAnswerChange.emit(event.target.value);
    }
  }

  handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      this.descriptiveAnswer = value;
      this.descriptiveAnswerChange.emit(value);
    }
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLanguage = select.value;
    this.editorOptions = {
      ...this.editorOptions,
      language: select.value,
    };
  }

  toggleAnswerType(): void {
    this.answerType = this.answerType === 'text' ? 'code' : 'text';
    // Clear answer when switching types
    this.descriptiveAnswer = '';
    this.descriptiveAnswerChange.emit('');
  }
}
