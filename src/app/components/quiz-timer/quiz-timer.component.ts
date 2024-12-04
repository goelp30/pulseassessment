import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-red-500 text-white text-center p-4 rounded shadow-md mb-4">
      <h3>
        TIME LEFT {{ questionType ? '(' + questionType.toUpperCase() + ')' : '' }}: 
        <span class="font-bold text-xl">{{ formattedTime }}</span>
      </h3>
    </div>
  `
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