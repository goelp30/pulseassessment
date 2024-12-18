import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-quiz-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-red-500 text-white p-4 rounded-xl">
      <div class="text-sm mb-1">TIME LEFT:</div>
      <div class="text-3xl font-bold">{{ formattedTime }}</div>
    </div>
  `
})
export class QuizTimerComponent implements OnInit, OnDestroy {
  @Input() totalTime: number = 0;
  @Output() timeUp = new EventEmitter<void>();
 
  private timer?: any;
  totalSeconds = 0;
 
  ngOnInit() {
    this.calculateTotalTime();
  }
 
  ngOnDestroy() {
    this.clearTimer();
  }
 
  private calculateTotalTime() {
    this.totalSeconds = this.totalTime * 60; // Convert minutes to seconds
    this.startTimer();
  }
 
  private startTimer() {
    this.timer = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
      } else {
        this.timeUp.emit();
        this.clearTimer();
      }
    }, 1000);
  }
 
  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
 
  get formattedTime(): string {
    const hours = Math.floor(this.totalSeconds / 3600);
    const minutes = Math.floor((this.totalSeconds % 3600) / 60);
    const seconds = this.totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}