import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question, Option } from '../../../../models/question';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';
import { SubmissionModalComponent } from '../submission-modal/submission-modal.component';
import { QuizAnswerService } from '../../services/quiz-answer.service';
import { ToastService } from '../../services/toast.service';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { assessmentRecords } from '../../../../models/assessmentRecords';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    QuestionDisplayComponent,
    QuestionNavigatorComponent,
    QuizTimerComponent,
    SubmissionModalComponent,
  ],
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  options: { [key: string]: Option[] } = {};
  currentQuestion = 0;
  loading = true;
  userId: string = '';
  assessmentId: string = '';
  showModal = false;
  totalQuestionTime: number = 0; // New property to store total question time

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private quizAnswerService: QuizAnswerService, //---------
    private toastService: ToastService,
    private firebaseService: FireBaseService<assessmentRecords>
  ) {}

  ngOnInit(): void {
    const state = window.history.state;
    if (state?.assessmentId) {
      this.assessmentId = state.assessmentId;
      this.quizAnswerService.setAssessmentId(this.assessmentId); // Set userId in the service
      console.log('Assessment ID from state:', this.assessmentId);
    } else {
      console.error('Assessment ID not found in router state');
      return;
    }
    if (state?.userId) {
      //--------
      this.userId = state.userId;
      this.quizAnswerService.setUserId(this.userId); // Set userId in the service
    }

    this.loadAssessmentData();
  }

  private loadAssessmentData(): void {
    this.loading = true;

    this.quizService
      .getAssessmentById(this.assessmentId)
      .subscribe((assessment) => {
        if (assessment) {
          console.log('Found assessment:', assessment);
          this.quizService
            .getQuestionsBySubjects(Object.keys(assessment.subjects))
            .subscribe((questions) => {
              this.questions = this.quizService.filterQuestionsByDifficulty(
                questions,
                assessment
              );

              // Calculate total question time
              this.totalQuestionTime = this.questions.reduce(
                (total, question) => total + question.questionTime,
                0
              );

              const questionIds = this.questions.map((q) => q.questionId);
              this.quizService
                .getOptionsForQuestions(questionIds)
                .subscribe((options) => {
                  this.options = options;
                  this.loading = false;
                });
            });
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

  isNextButtonDisabled(): boolean {
    const currentQuestionAnswer =
      this.quizAnswerService.getUserAnswers()[
        this.questions[this.currentQuestion]?.questionId
      ];
    const descriptiveAnswer =
      this.questions[this.currentQuestion]?.descriptiveAnswer?.trim();

    // Check if the current question is the last question
    const isLastQuestion = this.currentQuestion === this.questions.length - 1;

    // Return true if no option is selected, the question is not marked for review, the descriptive box is empty, or if it's the last question
    return (
      isLastQuestion || // Disable if it's the last question
      (!this.questions[this.currentQuestion]?.isMarkedForReview &&
        !currentQuestionAnswer?.userAnswer?.length &&
        !descriptiveAnswer)
    );
  }

  onAnswerSelect(optionId: string) {
    // this.quizAnswerService.storeAnswer(this.currentQuestionData.questionId, false, [optionId]); //-----
    const isDescriptive =
      this.currentQuestionData.questionType === 'Descriptive';
    this.quizAnswerService.storeAnswer(
      this.currentQuestionData.questionId,
      isDescriptive,
      [optionId]
    );
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

  allQuestionsVisited(): boolean {
    // Check if all questions have been visited (i.e., answered or have a descriptive answer)
    return this.questions.every((question) => question.isVisited);
  }

  submitQuiz() {
    console.log('Quiz submitted:', this.questions);
    console.log('User ID:', this.userId);
    // Ensure all questions are saved, attempted or not
    this.questions.forEach((question) => {
      const answer =
        this.quizAnswerService.getUserAnswers()[question.questionId];
      if (answer) {
        // If there is an answer, store it (either descriptive or not)
        this.quizAnswerService.storeAnswer(
          question.questionId,
          answer.isDescriptive,
          answer.userAnswer || answer.answer || [] // Ensure that it never passes undefined
        );
      } else {
        // For non-attempted questions, save a placeholder or empty answer
        this.quizAnswerService.storeAnswer(question.questionId, false, []); // Empty array for non-attempted questions
      }
    });

    this.quizAnswerService.submitQuiz(this.questions);
    this.showModal = false;
    this.updateAssessmentRecord();
    this.toastService.showSuccess('Quiz submitted successfully!');
  }

  submitFinalQuiz() {
    this.showModal = true;
  }

  private updateAssessmentRecord() {
    const recordKey = `${this.assessmentId}_${this.userId}`;
    this.firebaseService
      .update(`assessmentRecords/${recordKey}`, {
        inProgress: false,
        isCompleted: true,
      })
      .then(() => {
        console.log('Assessment record updated successfully');
      })
      .catch((error) => {
        console.error('Error updating assessment record', error);
      });
  }

  handleTimeUp() {
    this.submitQuiz();
    this.toastService.showInfo("Time's up! We'll submit your quiz now.");
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
