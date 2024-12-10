import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ButtonComponent } from '../../common/button/button.component';
import { Location } from '@angular/common';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluate-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css']
})
export class EvaluateAssessmentComponent {
  clickedData: any;
  successMessage: boolean = false;

  constructor(private evaluationService: EvaluationService, private router: Router) {}

  ngOnInit(): void {
    // Fetch the data when the component initializes
    this.clickedData = this.evaluationService.getData();
    console.log(this.clickedData);  // Logs the data for debugging

    // Automatically evaluate the objective questions (single_answer, multi_answer)
    this.evaluateAutoScoredQuestions();
  }
  getTotalMarks(): number {
    // Calculate the total max marks for all questions
    let totalMarks = 0;
    this.clickedData.questions.forEach((question: any) => {
      totalMarks += question.totalMarks; // Add up totalMarks from all questions
    });
    return totalMarks;
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

        // Apply penalties for extra answers selected
        const extraAnswersSelected = selectedAnswers.length - correctAnswers.length;
        if (extraAnswersSelected > 0) {
          const penaltyPerExtraAnswer = question.totalMarks / correctAnswers.length;
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
    // Ensure all questions are evaluated first
    if (this.clickedData?.isEvaluation) {
      // If evaluation is already done, navigate to the 'view' page
      this.router.navigate(['/view']);
      return;
    }

    // Handle manual grading for descriptive questions
    this.clickedData.questions.forEach((question: any) => {
      if (question.question_type === 'descriptive') {
        // Manually assign the marks for descriptive questions
        question.marksScored = question.assigned_marks;
      }
    });

    // After assigning marks for descriptive questions, recalculate total marks
    this.calculateTotalMarks();

    // Set the isEvaluation flag to true to indicate that the evaluation is complete
    this.clickedData.isEvaluation = true;

    // Show success message after the evaluation is complete
    this.successMessage = true;

    // Navigate to the 'view' page after the evaluation is done
    this.router.navigate(['/view']);
  }


  isCorrect(userAnswer: string, question: any): boolean {
    // Check if the user's answer matches the correct answer for single-answer questions
    return userAnswer === question.correct_answer;
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
