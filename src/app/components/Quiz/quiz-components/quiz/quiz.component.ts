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

@Component({
  standalone:true,
  imports: [CommonModule, QuestionDisplayComponent, QuestionNavigatorComponent, QuizTimerComponent, SubmissionModalComponent],
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl:'./quiz.component.css'
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private quizAnswerService: QuizAnswerService,
    private toastService: ToastService,
    private firebaseService: FireBaseService<any>
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
        this.toastService.showError('Quiz terminated due to multiple page refreshes');
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
      this.quizAnswerService.setAssessmentId(this.assessmentId);  // Set userId in the service
      console.log('Assessment ID from state:', this.assessmentId);
    } else {
      console.error('Assessment ID not found in router state');
      return;
    }
    if (state?.userId) { //--------
      this.userId = state.userId;
      this.quizAnswerService.setUserId(this.userId);  // Set userId in the service  
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

            // Calculate total question time
            this.totalQuestionTime = this.questions.reduce((total, question) => total + question.questionTime, 0);

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


  isNextButtonDisabled(): boolean {
    const currentQuestionAnswer = this.quizAnswerService.getUserAnswers()[this.questions[this.currentQuestion]?.questionId];
    const descriptiveAnswer = this.questions[this.currentQuestion]?.descriptiveAnswer?.trim();
    
    // Check if the current question is the last question
    const isLastQuestion = this.currentQuestion === this.questions.length - 1;
  
    // Return true if no option is selected, the question is not marked for review, the descriptive box is empty, or if it's the last question
    return (
      isLastQuestion || // Disable if it's the last question
      !this.questions[this.currentQuestion]?.isMarkedForReview &&
      (!currentQuestionAnswer?.userAnswer?.length && !descriptiveAnswer)
    );
  }
  

  onAnswerSelect(optionId: string) {
    // Calculate marks immediately when an answer is selected
    let marks = '0';
    const isDescriptive = this.currentQuestionData.questionType === 'Descriptive';

    if (!isDescriptive) {
      marks = this.quizService.evaluateAutoScoredQuestions(
        this.currentQuestionData,
        this.currentQuestionOptions,
        optionId  // Pass the optionId directly
      ).toString();
      console.log('Answer Selected:', {
        questionId: this.currentQuestionData.questionId,
        selectedOption: optionId,
        calculatedMarks: marks
      });
    }

    // Store the answer
    this.quizAnswerService.storeAnswer(
      this.currentQuestionData.questionId,
      isDescriptive,
      [optionId],
      marks,
      ''
    );

    // Mark question as visited
    this.questions[this.currentQuestion].isVisited = true;
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
      
      const currentQuestionAnswer = this.quizAnswerService.getUserAnswers()[question?.questionId];
      const descriptiveAnswer = question?.descriptiveAnswer?.trim();
      
      return (currentQuestionAnswer?.userAnswer?.length ?? 0) > 0 || 
             (descriptiveAnswer?.length ?? 0) > 0;
    });
  }
  
  

  onDescriptiveAnswerChange(answer: string) {
    console.log('Descriptive answer received:', answer);
    
    if (this.currentQuestionData && this.currentQuestionData.questionType === 'Descriptive') {
      // Store descriptive answer
      this.quizAnswerService.storeAnswer(
        this.currentQuestionData.questionId,
        true, // isDescriptive
        [], // empty userAnswer array for descriptive
        '0', // initial marks
        answer.trim() // Store the descriptive answer
      );

      // Mark question as visited
      this.questions[this.currentQuestion].isVisited = true;
      this.questions[this.currentQuestion].descriptiveAnswer = answer.trim();

      console.log('Descriptive Answer Stored:', {
        questionId: this.currentQuestionData.questionId,
        answer: answer,
        question: this.currentQuestionData
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

  submitQuiz() {
    console.log('Quiz submitted:', this.questions);
    
    const userAnswers = this.quizAnswerService.getUserAnswers();
    let totalMarks = 0;
    let hasDescriptiveAnswers = false;
    
    this.questions.forEach((question) => {
      const answer = userAnswers[question.questionId];
      let marks = '0';

      if (question.questionType === 'Descriptive') {
        if (answer?.answer && answer.answer.trim()) {
          hasDescriptiveAnswers = true;
          console.log('Descriptive answer found:', {
            questionId: question.questionId,
            answer: answer.answer
          });
          
          // Store descriptive answer for evaluation
          this.quizAnswerService.storeAnswer(
            question.questionId,
            true,
            [],
            '0',
            answer.answer.trim()
          );
        }
      } else if (answer) {
        // Handle non-descriptive questions as before
        marks = this.quizService.evaluateAutoScoredQuestions(
          question,
          this.options[question.questionId] || [],
          answer.userAnswer
        ).toString();
        totalMarks += Number(marks);

        this.quizAnswerService.storeAnswer(
          question.questionId,
          false,
          answer.userAnswer || [],
          marks,
          ''
        );
      }
    });

    console.log('Final Quiz Results:', {
      totalMarks,
      totalQuestions: this.questions.length,
      hasDescriptiveAnswers,
      userAnswers
    });

    // Submit the quiz with the calculated marks
    this.quizAnswerService.submitQuiz(this.questions, totalMarks);
    
    if (hasDescriptiveAnswers) {
      this.toastService.showInfo('Quiz submitted successfully! Descriptive answers will be evaluated by the examiner.');
    } else {
      this.toastService.showSuccess('Quiz submitted successfully!');
    }
    this.updateAssessmentRecord();
    this.showModal = false;
  }

  submitFinalQuiz() {
    
    this.showModal = true;
  }

  handleTimeUp() {
    this.submitQuiz();
    this.toastService.showInfo("Time's up! We'll submit your quiz now.");
  }

  ngOnDestroy() {
    sessionStorage.removeItem('quizReloadCount');
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
  }
}