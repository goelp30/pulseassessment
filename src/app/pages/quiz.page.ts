import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../components/question-display/question-display.component';
import { QuestionNavigatorComponent } from '../components/question-navigator/question-navigator.component';
import { QuizTimerComponent } from '../components/quiz-timer/quiz-timer.component';
import { SubmissionModalComponent } from '../components/submission-modal/submission-modal.component';
import { QuizService } from '../services/quiz.service';
import { ToastService } from '../services/toast.service';
import { Question } from '../models/question.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    QuestionDisplayComponent,
    QuestionNavigatorComponent,
    QuizTimerComponent,
    SubmissionModalComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <h1 class="text-3xl font-bold text-gray-900">Angular Quiz Application</h1>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div class="flex-1">
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="p-6">
              <app-question-display
                [question]="questions[currentQuestion]"
                [questionNumber]="currentQuestion + 1"
                [totalQuestions]="questions.length"
                (answerSelect)="selectAnswer($event)"
                (descriptiveAnswerChange)="setDescriptiveAnswer($event)"
                (reviewToggle)="toggleReview()"
              ></app-question-display>

              <div class="flex justify-between items-center mt-6">
                <button 
                  (click)="previousQuestion()" 
                  [disabled]="currentQuestion === 0"
                  class="btn btn-secondary">
                  Previous
                </button>
                <button 
                  (click)="submitQuiz()"
                  class="btn btn-success">
                  Submit Quiz
                </button>
                <button 
                (click)="nextQuestion()" 
                [disabled]="!isCurrentQuestionAttempted() || currentQuestion === questions.length - 1"
                [ngClass]="{ 'bg-gray-400 cursor-not-allowed opacity-70': !isCurrentQuestionAttempted() || currentQuestion === questions.length - 1 }"
                class="btn btn-primary px-4 py-2 rounded-lg text-white transition-all duration-300 ease-in-out">
                Next
                </button>

              </div>
            </div>
          </div>
        </div>

        <div class="w-64 flex-shrink-0">
          <app-quiz-timer
            [totalSeconds]="totalSeconds"
            [questionType]="questions[currentQuestion].questionType"
            (timeUp)="handleTimeUp()"
          ></app-quiz-timer>
          <app-question-navigator
            [questions]="questions"
            [currentQuestionIndex]="currentQuestion"
            (questionSelect)="goToQuestion($event)"
          ></app-question-navigator>
        </div>
      </div>
    </div>

    <app-submission-modal
      [show]="showSubmissionModal"
      [questions]="questions"
      (onConfirm)="confirmSubmit()"
      (onCancel)="closeSubmissionModal()"
    ></app-submission-modal>
  `,
})
export class QuizPage implements OnInit, OnDestroy {
  questions: Question[] = [];
  currentQuestion = 0;
  totalSeconds = 0;
  private timerInterval: any;
  showSubmissionModal = false;

  constructor(
    private quizService: QuizService,
    private toastService: ToastService
  ) {
    this.questions = this.quizService.generateQuestions();
  }

  ngOnInit() {
    this.calculateTotalTime();
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private calculateTotalTime() {
    this.totalSeconds = this.questions.reduce((total, q) =>
      total + this.quizService.calculateQuestionTime(q.questionType), 0);
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        if (this.totalSeconds === 120) {
          this.toastService.showWarning('⚠️ Only 2 minutes remaining!');
        }
      } else {
        this.handleTimeUp();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  handleTimeUp() {
    this.clearTimer();
    this.toastService.showInfo("Time's up! We'll let you know about further updates soon.");
    setTimeout(() => window.close(), 3000);
  }

  submitQuiz() {
    this.showSubmissionModal = true;
  }

  confirmSubmit() {
    this.closeSubmissionModal();
    this.clearTimer();
    this.toastService.showSuccess('Quiz submitted successfully! Thank you for your participation.');
    setTimeout(() => window.close(), 3000);
  }

  closeSubmissionModal() {
    this.showSubmissionModal = false;
  }

  selectAnswer(answer: number) {
    this.questions[this.currentQuestion].selectedAnswer = answer;
  }

  setDescriptiveAnswer(answer: string) {
    this.questions[this.currentQuestion].descriptiveAnswer = answer;
  }

  toggleReview() {
    this.questions[this.currentQuestion].isMarkedForReview =
      !this.questions[this.currentQuestion].isMarkedForReview;
  }

  goToQuestion(index: number) {
    this.questions[this.currentQuestion].isVisited = true;
    this.currentQuestion = index;
    this.questions[index].isVisited = true;
  }

  nextQuestion() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.goToQuestion(this.currentQuestion + 1);
    }
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.goToQuestion(this.currentQuestion - 1);
    }
  }

  isCurrentQuestionAttempted(): boolean {
    const current = this.questions[this.currentQuestion];
    return current.questionType === 'descriptive'
      ? (current.descriptiveAnswer?.trim().length || 0) > 0
      : current.selectedAnswer !== undefined;
  }
  
}
