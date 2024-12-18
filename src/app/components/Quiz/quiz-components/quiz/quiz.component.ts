import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FireBaseService } from '../../../../../sharedServices/FireBaseService';
import { Option, Question } from '../../../../models/question';
import { CommonModule } from '@angular/common';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { QuestionNavigatorComponent } from '../question-navigator/question-navigator.component';
import { QuizTimerComponent } from '../quiz-timer/quiz-timer.component';
import { AssessmentList } from '../../../../models/newassessment';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, QuestionDisplayComponent, QuestionNavigatorComponent, QuizTimerComponent],
  templateUrl: './quiz.component.html'
})
export class QuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  options: { [key: string]: Option[] } = {};
  currentQuestion = 0;
  totalSeconds = 2400; 
  loading = true;
  userId: string = '';  

  assessmentId: string = ''; //----------------

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FireBaseService<Question | Option| AssessmentList>
  ) {}

  ngOnInit(): void {
    // Access userId from Router state
    const state = window.history.state;
    if (state?.assessmentId) {
      this.assessmentId = state.assessmentId;  // Get assessmentId from router state
      console.log('Assessment ID from state:', this.assessmentId);
    } else {
      console.error('Assessment ID not found in router state');
    }

    // if (state?.userId) {
    //   this.userId = state.userId;  // Get userId from router state
    //   console.log('User ID from state:', this.userId);
    // } else {
    //   console.error('User ID not found in router state');
    // }

    // Load the questions and options
    // this.loadNextQuestion();
    this.loadAssessmentQuestions(); //--------------
  }

  // Function to load the next question dynamically based on currentQuestionId
   // Function to load the questions based on assessmentId and its subjects
   private loadAssessmentQuestions() {
  // private loadNextQuestion() {
    this.loading = true;

    // Load all questions
    // Load the assessment list to find the subjects
    this.firebaseService.getAllData('assessmentList').subscribe(
      (assessments: AssessmentList[]) => {
        const assessment = assessments.find(a => a.assessmentId === this.assessmentId);
        if (assessment) {
          console.log('Found assessment:', assessment);
          this.loadQuestionsBasedOnSubjects(assessment);
        } else {
          console.error('Assessment not found!');
        }
      }
    );
  }
   // Function to load questions based on subjects from the assessment
   private loadQuestionsBasedOnSubjects(assessment: AssessmentList) {
    const subjectIds = Object.keys(assessment.subjects);

    // Load all questions based on the subjectIds
    this.firebaseService.getAllData('questions').subscribe(
      (questions: Question[]) => {
        this.questions = questions.filter(q => subjectIds.includes(q.subjectId));
        
        // Load options related to these questions
        this.firebaseService.getAllData('options').subscribe(
          (options: Option[]) => {
            options.forEach(option => {
              const question = this.questions.find(q => q.questionId === option.questionId);
              if (question) {
                if (!this.options[question.questionId]) {
                  this.options[question.questionId] = [];
                }
                this.options[question.questionId].push(option);
              }
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