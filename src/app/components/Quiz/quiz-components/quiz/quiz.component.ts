import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question, Option } from '../../../../models/question';
import { AssessmentList } from '../../../../models/newassessment';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';

@Component({
  standalone:true,
  imports: [CommonModule, QuestionDisplayComponent, QuestionNavigatorComponent, QuizTimerComponent],
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  options: { [key: string]: Option[] } = {};
  currentQuestion = 0;
  loading = true;
  userId: string = '';
  assessmentId: string = '';
  totalSeconds = 2400; 

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const state = window.history.state;
    if (state?.assessmentId) {
      this.assessmentId = state.assessmentId;
      console.log('Assessment ID from state:', this.assessmentId);
    } else {
      console.error('Assessment ID not found in router state');
      return;
    }

    this.loadAssessmentData();
  }

  private loadAssessmentData(): void {
    this.loading = true;

    this.quizService.getAssessmentById(this.assessmentId).subscribe((assessment) => {
      if (assessment) {
        console.log('Found assessment:', assessment);
        this.quizService.getQuestionsBySubjects(Object.keys(assessment.subjects)).subscribe(
          (questions) => {
            this.questions = this.quizService.filterQuestionsByDifficulty(
              questions,
              assessment
            );

            const questionIds = this.questions.map((q) => q.questionId);
            this.quizService.getOptionsForQuestions(questionIds).subscribe((options) => {
              this.options = options;
              this.loading = false;
            });
          }
        );
      } else {
        console.error('Assessment not found!');
        this.loading = false;
      }
    });
  }

  get currentQuestionData(): Question {
    return this.questions[this.currentQuestion];
  }

  get currentQuestionOptions(): Option[] {
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
