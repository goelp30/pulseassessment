import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  reloadCount = 0;
  showReloadWarningModal = false;
  private beforeUnloadListener: any;
  showAutoSubmitModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private quizAnswerService: QuizAnswerService,
    private toastService: ToastService,
    private firebaseService: FireBaseService<assessmentRecords>
  ) {
    this.handlePageReload();
    this.setupBeforeUnloadListener();
  }

  private setupBeforeUnloadListener(): void {
    this.beforeUnloadListener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return ''; // Required for other browsers
    };
    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }

  private handlePageReload(): void {
    const storedCount = sessionStorage.getItem('quizReloadCount');
    this.reloadCount = storedCount ? parseInt(storedCount, 10) : 0;

    if (performance.navigation.type === 1) {
      this.reloadCount++;
      sessionStorage.setItem('quizReloadCount', this.reloadCount.toString());

      if (this.reloadCount === 1) {
        this.showReloadWarningModal = true;
      } else if (this.reloadCount >= 2) {
        this.router.navigate(['/invalid']);
        this.toastService.showError(
          'Quiz terminated due to multiple page refreshes'
        );
      }
    }
  }

  closeReloadWarning(): void {
    this.showReloadWarningModal = false;
  }

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
    const currentQuestion = this.questions[this.currentQuestion];
    const currentQuestionAnswer =
      this.quizAnswerService.getUserAnswers()[currentQuestion?.questionId];

    // Check if the current question is the last question
    const isLastQuestion = this.currentQuestion === this.questions.length - 1;

    if (isLastQuestion) {
      return true;
    }

    // If question is marked for review, enable Next button
    if (currentQuestion?.isMarkedForReview) {
      return false;
    }

    // For descriptive questions, enable Next if visited
    if (currentQuestion?.questionType === 'Descriptive') {
      return !currentQuestion.isVisited;
    }

    // For other question types, check for answers
    return !currentQuestionAnswer?.userAnswer?.length;
  }

  onAnswerSelect(optionId: string) {
    const isDescriptive =
      this.currentQuestionData.questionType === 'Descriptive';
    let marks = '0';
    let userAnswers: string[] = [];

    if (!isDescriptive) {
      if (this.currentQuestionData.questionType === 'Single') {
        // For single choice, always override with new selection
        userAnswers = [optionId];

        // Update the question's selected answer
        this.questions[this.currentQuestion].selectedAnswer = optionId;
      } else {
        // For multi choice, get current state from the question component
        userAnswers = Array.isArray(
          this.questions[this.currentQuestion].selectedAnswer
        )
          ? [...this.questions[this.currentQuestion].selectedAnswer]
          : [];
      }

      marks = this.quizService
        .evaluateAutoScoredQuestions(
          this.currentQuestionData,
          this.currentQuestionOptions,
          userAnswers
        )
        .toString();

      console.log('Answer Updated:', {
        questionId: this.currentQuestionData.questionId,
        userAnswers,
        calculatedMarks: marks,
      });

      // Store and override the answer in Firebase
      this.quizAnswerService.storeAnswer(
        this.currentQuestionData.questionId,
        isDescriptive,
        userAnswers,
        marks,
        ''
      );

      // Mark question as visited
      this.questions[this.currentQuestion].isVisited = true;
    }
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
    return this.questions.every((question) => {
      if (question.isVisited) return true;

      const currentQuestionAnswer =
        this.quizAnswerService.getUserAnswers()[question?.questionId];
      const descriptiveAnswer = question?.descriptiveAnswer?.trim();

      return (
        (currentQuestionAnswer?.userAnswer?.length ?? 0) > 0 ||
        (descriptiveAnswer?.length ?? 0) > 0
      );
    });
  }

  onDescriptiveAnswerChange(answerData: {
    questionId: string;
    answer: string;
  }) {
    console.log('Descriptive answer received:', answerData);

    if (
      this.currentQuestionData &&
      this.currentQuestionData.questionType === 'Descriptive'
    ) {
      // Store descriptive answer
      this.quizAnswerService.storeAnswer(
        answerData.questionId,
        true,
        [],
        '0',
        answerData.answer.trim()
      );

      // Mark question as visited
      const questionIndex = this.questions.findIndex(
        (q) => q.questionId === answerData.questionId
      );
      if (questionIndex !== -1) {
        this.questions[questionIndex].isVisited = true;
        this.questions[questionIndex].descriptiveAnswer =
          answerData.answer.trim();
      }

      console.log('Descriptive Answer Stored:', {
        questionId: answerData.questionId,
        answer: answerData.answer,
        question: this.questions[questionIndex],
      });
    }
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

  submitQuiz(isAutoSubmit: boolean = false) {
    console.log('Quiz submitted:', this.questions);

    const userAnswers = this.quizAnswerService.getUserAnswers();
    let totalMarks = 0;
    let hasDescriptiveAnswers = false;

    this.questions.forEach((question) => {
      const answer = userAnswers[question.questionId];
      let marks = '0';

      if (question.questionType === 'Descriptive') {
        // For descriptive questions, check if there's an answer
        if (answer?.answer && answer.answer.trim()) {
          hasDescriptiveAnswers = true;
          this.quizAnswerService.storeAnswer(
            question.questionId,
            true,
            [],
            '0',
            answer.answer.trim()
          );
        } else if (isAutoSubmit) {
          // For auto-submit, store empty answer for unattempted descriptive questions
          this.quizAnswerService.storeAnswer(
            question.questionId,
            true,
            [],
            '0',
            ''
          );
        }
      } else {
        // For MCQ/Single choice questions
        if (answer?.userAnswer?.length) {
          // Question was attempted
          marks = this.quizService
            .evaluateAutoScoredQuestions(
              question,
              this.options[question.questionId] || [],
              answer.userAnswer
            )
            .toString();
          totalMarks += Number(marks);
        }

        // Store answer whether attempted or not
        this.quizAnswerService.storeAnswer(
          question.questionId,
          false,
          answer?.userAnswer || [],
          marks,
          ''
        );
      }
    });

    console.log('Final Quiz Results:', {
      totalMarks,
      totalQuestions: this.questions.length,
      hasDescriptiveAnswers,
      userAnswers,
      isAutoSubmit,
    });

    // Submit the quiz with the calculated marks
    this.quizAnswerService.submitQuiz(this.questions, totalMarks);

    if (hasDescriptiveAnswers) {
      this.toastService.showInfo(
        'Quiz submitted successfully! Descriptive answers will be evaluated by the examiner.'
      );
    } else {
      this.toastService.showSuccess('Quiz submitted successfully!');
    }

    this.updateAssessmentRecord();
    this.showModal = false;

    // Only navigate if it's not an auto-submit
    if (!isAutoSubmit) {
      this.router.navigate(['/thank-you']);
    }
  }

  submitFinalQuiz() {
    this.showModal = true;
  }

  handleTimeUp() {
    this.submitQuiz(true);
    this.showAutoSubmitModal = true;
  }

  closeAutoSubmitModal() {
    this.showAutoSubmitModal = false;
    this.router.navigate(['/thank-you']);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('quizReloadCount');
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
  }

  onDescriptiveQuestionTouched(): void {
    if (this.currentQuestionData?.questionType === 'Descriptive') {
      this.questions[this.currentQuestion].isVisited = true;
    }
  }
}
