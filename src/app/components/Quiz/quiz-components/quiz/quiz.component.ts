import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { Options, Question } from '../../../../models/question.model';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, QuestionDisplayComponent, QuestionNavigatorComponent, QuizTimerComponent],
  templateUrl: './quiz.component.html'
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  options: { [key: string]: Options[] } = {};
  currentQuestion = 0;
  totalSeconds = 2400; // 40 minutes
  loading = true;
  userId: string = '';  // Declare userId variable

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FireBaseService<Question | Options>
  ) {}

  ngOnInit(): void {
    // Access userId from Router state
    const state = window.history.state;
    if (state?.userId) {
      this.userId = state.userId;  // Get userId from router state
      console.log('User ID from state:', this.userId);
    } else {
      console.error('User ID not found in router state');
    }

    // Load the questions and options
    this.loadNextQuestion();
  }

  // Function to load the next question dynamically based on currentQuestionId
  private loadNextQuestion() {
    this.loading = true;

    // Load all questions
    this.firebaseService.getAllData('questions').subscribe(
      (questions: Question[]) => {
        this.questions = questions.map(q => ({
          ...q,
          isMarkedForReview: false,
          isVisited: true
        }));

        // Load options related to this question
        this.firebaseService.getAllData('options').subscribe(
          (options: Options[]) => {
            options.forEach(option => {
              if (!this.options[option.questionId]) {
                this.options[option.questionId] = [];
              }
              this.options[option.questionId].push(option);
            });

            // Once data is loaded, set loading to false
            this.loading = false;
          }
        );
      }
    );
  }

  get currentQuestionData(): Question {
    return this.questions[this.currentQuestion];
  }

  get currentQuestionOptions(): Options[] {
    return this.options[this.currentQuestionData?.questionId.toString()] || [];
  }

  onAnswerSelect(optionId: number) {
    this.questions[this.currentQuestion].selectedAnswer = optionId;
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
    } else {
      this.submitQuiz();
    }
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.goToQuestion(this.currentQuestion - 1);
    }
  }

  submitQuiz() {
    console.log('Quiz submitted:', this.questions);
    console.log('User ID:', this.userId);
    // Handle quiz submission logic here
  }

  handleTimeUp() {
    this.submitQuiz();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}