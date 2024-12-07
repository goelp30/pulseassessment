import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ButtonComponent } from '../../common/button/button.component';
import { Location } from '@angular/common';
import { EvaluationService } from '../service/evaluation.service';

@Component({
  selector: 'app-evaluate-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css']
})
export class EvaluateAssessmentComponent {
  clickedData: any;

  constructor(private location: Location, private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    // Fetch the data when the component initializes
    this.clickedData = this.evaluationService.getData();
    console.log(this.clickedData);  // Logs the data for debugging

    // Automatically evaluate the single_answer and multi_answer questions
    this.evaluateAutoScoredQuestions();
  }

  evaluateAutoScoredQuestions(): void {
    this.clickedData?.questions.forEach((question: any) => {
      if (question.question_type === 'single_answer') {
        // Automatically calculate marks for single-answer questions
        if (this.isCorrect(question.user_answer, question)) {
          question.marksScored = question.totalMarks;
        } else {
          question.marksScored = 0;
        }
      } else if (question.question_type === 'multi_answer') {
        // Automatically calculate marks for multi-answer questions
        const correctAnswers = question.correct_answers;
        const selectedAnswers = question.user_answer;
        let correctCount = 0;
  
        // Loop over selected answers and count correct ones
        selectedAnswers?.forEach((answer: any) => {
          if (correctAnswers.includes(answer)) {
            correctCount++;
          }
        });
  
        // Calculate marks based on correct answers
        if (correctCount > 0) {
          const marksPerCorrectAnswer = question.totalMarks / correctAnswers.length;
          question.marksScored = correctCount * marksPerCorrectAnswer;
        } else {
          question.marksScored = 0;
        }
  
        // Check if user selected more answers than correct answers
        const extraAnswersSelected = selectedAnswers.length - correctAnswers.length;
  
        if (extraAnswersSelected > 0) {
          // Apply a penalty for extra selections
          const penaltyPerExtraAnswer = question.totalMarks * 0.1; // 10% penalty per extra answer
          question.marksScored -= extraAnswersSelected * penaltyPerExtraAnswer;
  
          // Ensure marks don't go negative
          if (question.marksScored < 0) {
            question.marksScored = 0;
          }
        }
      }
    });
  }
  
  onSubmit(): void {
    if (this.clickedData.marksScored) {
      // Only navigate to the previous page if marks have already been scored (when "Close" is shown)
      this.location.back();
    } else {
      // Manually score descriptive questions if isAutoEvaluate is false
      if (!this.clickedData.isAutoEvaluate) {
        this.clickedData.questions.forEach((question: any) => {
          if (question.question_type === 'descriptive') {
            // Directly assign the marks for descriptive questions
            question.marksScored = question.assigned_marks;
          }
        });
      }

      // Recalculate the total marks scored, including marks for all question types
      this.calculateTotalMarks();

      // Now that the evaluation is done, we will not navigate yet (we are still on "Complete Evaluation")
      // Marks will be scored but no navigation
    }
  }

  isCorrect(userAnswer: string, question: any): boolean {
    // Check if the user's answer matches the correct answer for single-answer questions
    return userAnswer === question.correct_answer;  // Assuming correct_answer is stored as a string for single-answer questions
  }

  calculateTotalMarks(): void {
    // Calculate the total marks scored by the user, including marks from all questions
    let quizMarks = 0;
    this.clickedData.questions.forEach((question: any) => {
      quizMarks += question.marksScored;  // Add marks for each question (single_answer, multi_answer, and descriptive)
    });
    this.clickedData.marksScored = quizMarks;  // Store the total marks in clickedData
  }
}