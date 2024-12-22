import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-quiz-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-timer.component.html',
})
export class QuizTimerComponent implements OnInit, OnDestroy {
  @Input() totalTime: number = 0;
  @Output() timeUp = new EventEmitter<void>();
  @Output() timerClassChanged = new EventEmitter<string>(); // Emit background color change
  timerClass: string = 'bg-green-500';

  private timer?: any;
  totalSeconds = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.calculateTotalTime();
    this.timerClassChanged.subscribe((newClass: string) => {
      this.timerClass = newClass; // Update the class when emitted
    });
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
        if (this.totalSeconds === 300) {
          this.toastService.showWarning('⚠️ Only 5 minutes remaining!');
        }
        this.emitTimerClass();
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

  private emitTimerClass() {
    if (this.totalSeconds <= 300) {
      this.timerClassChanged.emit('bg-red-400');
    } else {
      this.timerClass;
    }
  }

  get formattedTime(): string {
    const hours = Math.floor(this.totalSeconds / 3600);
    const minutes = Math.floor((this.totalSeconds % 3600) / 60);
    const seconds = this.totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
