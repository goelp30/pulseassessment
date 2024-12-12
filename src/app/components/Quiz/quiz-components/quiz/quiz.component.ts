import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';
import { SubmissionModalComponent } from '../submission-modal/submission-modal.component';
import { QuizService } from '../../services/quiz.service';
import { ToastService } from '../../services/toast.service';
import { Question } from '../../../../models/question.model';
import { ActivatedRoute } from '@angular/router';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { assessmentRecords } from '../../../../models/assessmentRecords';

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
  templateUrl: 'quiz.component.html',
  styleUrls: ['quiz.component.css'], // Corrected to 'styleUrls'
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  currentQuestion = 0;
  totalSeconds = 0;
  private timerInterval: any;
  showSubmissionModal = false;
  userId: string = '';
  assessmentId: string = '';
  constructor(
    private quizService: QuizService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private firebaseService: FireBaseService<assessmentRecords>
  ) {}

  get currentQuestionData(): Question {
    return this.questions[this.currentQuestion];
  }

  ngOnInit() {
    this.questions = this.quizService.generateQuestions();
    this.calculateTotalTime();
    this.startTimer();
    this.getParamsFromUrl()
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private calculateTotalTime() {
    this.totalSeconds = this.questions.reduce(
      (total, q) =>
        total + this.quizService.calculateQuestionTime(q.questionType),
      0
    );
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

  getParamsFromUrl(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['userId'];
      this.assessmentId = params['assessmentId'];
    });
  }

  confirmSubmit() {
    this.closeSubmissionModal();
    this.clearTimer();
    this.toastService.showSuccess(
      'Quiz submitted successfully! Thank you for your participation.'
    );
  
    // Update isComplete to true in the database
    const recordKey = `${this.assessmentId}_${this.userId}`;
    this.firebaseService
      .update(`assessmentRecords/${recordKey}`, {
        isCompleted: true, 
      })
      .then(() => {
        this.toastService.showSuccess('Your submission has been recorded.');
      })
      .catch((error) => {
        console.error('Error updating submission status:', error);
        this.toastService.showError(
          'There was an error saving your submission. Please try again.'
        );
      });
  }
  

  closeSubmissionModal() {
    this.showSubmissionModal = false;
  }

  selectAnswer(answer: number) {
    // Handle multi-check answer selection
    if (Array.isArray(this.questions[this.currentQuestion].selectedAnswer)) {
      const selectedAnswers = this.questions[this.currentQuestion]
        .selectedAnswer as number[];
      if (selectedAnswers.includes(answer)) {
        this.questions[this.currentQuestion].selectedAnswer =
          selectedAnswers.filter((a) => a !== answer); // Unselect
      } else {
        selectedAnswers.push(answer); // Select
        this.questions[this.currentQuestion].selectedAnswer = selectedAnswers;
      }
    } else {
      this.questions[this.currentQuestion].selectedAnswer = answer;
    }
  }

  setDescriptiveAnswer(answer: string) {
    this.questions[this.currentQuestion].descriptiveAnswer = answer;
  }

  toggleReview() {
    this.questions[this.currentQuestion].isMarkedForReview =
      !this.questions[this.currentQuestion].isMarkedForReview;
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.questions[this.currentQuestion].isVisited = true;
      this.currentQuestion = index;
      this.questions[index].isVisited = true;
    }
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

  // Modified isCurrentQuestionAttempted to include the marked-for-review logic
  isCurrentQuestionAttemptedOrMarked(): boolean {
    const current = this.questions[this.currentQuestion];
    return this.isCurrentQuestionAttempted() || current.isMarkedForReview;
  }

  // Check if the "Next" button should be enabled
  isNextButtonEnabled(): boolean {
    return (
      this.isCurrentQuestionAttemptedOrMarked() &&
      this.currentQuestion < this.questions.length - 1
    );
  }
}
