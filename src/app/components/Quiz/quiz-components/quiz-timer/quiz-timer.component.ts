import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"quiz-timer.component.html",
  styleUrl:"quiz-timer.component.css",
})
export class QuizTimerComponent {
  @Input() totalSeconds = 0;
  @Input() questionType?: string;
  @Output() timeUp = new EventEmitter<void>();

  get formattedTime(): string {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

