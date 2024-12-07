import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';
import { SubmissionModalComponent } from '../submission-modal/submission-modal.component';
import { QuizService } from '../../services/quiz.service';
import { ToastService } from '../../services/toast.service';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuestionNavigatorComponent,
    QuestionDisplayComponent,
    QuizTimerComponent,
    SubmissionModalComponent,
  ],
  templateUrl: "quiz.component.html",
  styleUrl:"quiz.component.css"
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  currentQuestion = 0;
  totalSeconds = 0;
  private timerInterval: any;
  showSubmissionModal = false;

  constructor(
    private quizService: QuizService,
    private toastService: ToastService
  ) {}

  get currentQuestionData(): Question {
    return this.questions[this.currentQuestion];
  }

  ngOnInit() {
    this.questions = this.quizService.generateQuestions();
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
    this.toastService.showInfo("Time's up! We'll submit your quiz now.");
    this.confirmSubmit();
  }

  submitQuiz() {
    this.showSubmissionModal = true;
  }

  confirmSubmit() {
    this.closeSubmissionModal();
    this.clearTimer();
    this.toastService.showSuccess('Quiz submitted successfully! Thank you for your participation.');
    // Here you would typically send the results to a server
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

