import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SentenceCasePipe } from '../service/sentence-case.pipe';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [FormsModule, CommonModule, NgClass, SentenceCasePipe],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css',
})
export class QuestionDisplayComponent {
  @Input() question: any;
  @Input() options: any[] = [];
  @Input() userAnswer: any;
  @Input() answer: any; 
  @Input() marks: number = 0;
  @Input() assignedMarks: number = 0;
  @Input() isDisabled: boolean = false; 
  @Output() marksChanged = new EventEmitter<any>();
  isCopied: boolean = false;
  showMarksError :boolean=false;  

  onMarksChange(): void {
    this.question.assigned_marks = this.question.assignedMarks;
    this.showMarksError=this.question.assignedMarks > this.question.questionWeitage;
    this.marksChanged.emit([this.question,this.showMarksError]);
  }
  // Copy to clipboard function
  copyToClipboard(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
    }, 1000);
  }
}
