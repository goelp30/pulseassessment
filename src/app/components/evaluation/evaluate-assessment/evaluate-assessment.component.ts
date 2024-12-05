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
      }
    });
  }

  // onSubmit(): void {
  //   if (this.clickedData.marksScored) {
  //     // Only navigate to the previous page if marks have already been scored (when "Close" is shown)
  //     this.location.back();
  //   } else {
  //     // Manually score descriptive questions if isAutoEvaluate is false
  //     if (!this.clickedData.isAutoEvaluate) {
  //       this.clickedData.questions.forEach((question: any) => {
  //         if (question.question_type === 'descriptive') {
  //           // Directly assign the marks for descriptive questions
  //           question.marksScored = question.assigned_marks;
  //         }
  //       });
  //     }

  //     // Recalculate the total marks scored, including marks for all question types
  //     this.calculateTotalMarks();

  //     // Now that the evaluation is done, we will not navigate yet (we are still on "Complete Evaluation")
  //     // Marks will be scored but no navigation
  //   }
  // }

  isCorrect(userAnswer: string, question: any): boolean {
    // Check if the user's answer matches the correct answer for single-answer questions
    return userAnswer === question.correct_answer;  // Assuming correct_answer is stored as a string for single-answer questions
  }

  // calculateTotalMarks(): void {
  //   // Calculate the total marks scored by the user, including marks from all questions
  //   let quizMarks = 0;
  //   this.clickedData.questions.forEach((question: any) => {
  //     quizMarks += question.marksScored;  // Add marks for each question (single_answer, multi_answer, and descriptive)
  //   });
  //   this.clickedData.marksScored = quizMarks;  // Store the total marks in clickedData
    
  // }


  onSubmit(): void {
    if (this.clickedData.marksScored) {
      // If marks have already been scored, navigate back
      this.location.back();
    } else {
      // Check for descriptive questions and handle them manually
      if (!this.clickedData.isAutoEvaluate) {
        this.clickedData.questions.forEach((question: any) => {
          if (question.question_type === 'descriptive') {
            // Manually assign marks for descriptive questions
            question.marksScored = question.assigned_marks || 0; // Default to 0 if not manually assigned
          }
        });
      }
  
      // Recalculate the total marks scored and percentage
      this.calculateTotalMarks();
      this.calculatePercentage();
  
      // Marks will be scored, but no navigation yet (this is still "Complete Evaluation")
      console.log("Evaluation Completed:", this.clickedData);
    }
  }
  
  calculateTotalMarks(): void {
    // Calculate the total marks scored across all questions
    let quizMarks = 0;
    let totalMarks = 0;
  
    this.clickedData.questions.forEach((question: any) => {
      quizMarks += question.marksScored; // Add marks for each question
      totalMarks += question.totalMarks; // Accumulate total possible marks
    });
  
    this.clickedData.marksScored = quizMarks; // Store scored marks
    this.clickedData.totalMarks = totalMarks; // Store total marks
  }
  
  // calculatePercentage(): void {
  //   // Calculate the percentage based on descriptive vs non-descriptive questions
  //   let autoEvaluatedMarks = 0;
  //   let manualEvaluatedMarks = 0;
  //   let totalAutoMarks = 0;
  //   let totalManualMarks = 0;
  
  //   this.clickedData.questions.forEach((question: any) => {
  //     if (question.question_type === 'descriptive') {
  //       manualEvaluatedMarks += question.marksScored; // Add descriptive question scores
  //       totalManualMarks += question.totalMarks; // Add descriptive question total marks
  //     } else {
  //       autoEvaluatedMarks += question.marksScored; // Add auto-evaluated question scores
  //       totalAutoMarks += question.totalMarks; // Add auto-evaluated question total marks
  //     }
  //   });
  
  //   // Calculate percentages for both categories
  //   const autoPercentage = totalAutoMarks
  //     ? (autoEvaluatedMarks / totalAutoMarks) * 100
  //     : 0;
  //   const manualPercentage = totalManualMarks
  //     ? (manualEvaluatedMarks / totalManualMarks) * 100
  //     : 0;
  
  //   // Log or store these values for further processing or display
  //   this.clickedData.autoPercentage = autoPercentage.toFixed(2); // Store auto-evaluated percentage
  //   this.clickedData.manualPercentage = manualPercentage.toFixed(2); // Store manually evaluated percentage
  //   this.clickedData.totalPercentage = (
  //     (autoEvaluatedMarks + manualEvaluatedMarks) /
  //     (totalAutoMarks + totalManualMarks)
  //   ) * 100;
  
  //   console.log("Auto-Evaluated Percentage:", this.clickedData.autoPercentage);
  //   console.log("Manually-Evaluated Percentage:", this.clickedData.manualPercentage);
  //   console.log("Total Percentage:", this.clickedData.totalPercentage);
  // }
  calculatePercentage(): void {
    // Calculate the percentage based on descriptive vs non-descriptive questions
    let autoEvaluatedMarks = 0;
    let manualEvaluatedMarks = 0;
    let totalAutoMarks = 0;
    let totalManualMarks = 0;
  
    this.clickedData.questions.forEach((question: any) => {
      if (question.question_type === 'descriptive') {
        manualEvaluatedMarks += question.marksScored; // Add descriptive question scores
        totalManualMarks += question.totalMarks; // Add descriptive question total marks
      } else {
        autoEvaluatedMarks += question.marksScored; // Add auto-evaluated question scores
        totalAutoMarks += question.totalMarks; // Add auto-evaluated question total marks
      }
    });
  
    // Calculate percentages for both categories
    const autoPercentage = totalAutoMarks
      ? (autoEvaluatedMarks / totalAutoMarks) * 100
      : 0;
    const manualPercentage = totalManualMarks
      ? (manualEvaluatedMarks / totalManualMarks) * 100
      : 0;
  
    // Log or store these values for further processing or display
    this.clickedData.autoPercentage = autoPercentage.toFixed(2); // Store auto-evaluated percentage
    this.clickedData.manualPercentage = manualPercentage.toFixed(2); // Store manually evaluated percentage
    this.clickedData.totalPercentage = (
      (autoEvaluatedMarks + manualEvaluatedMarks) /
      (totalAutoMarks + totalManualMarks)
    ) * 100;
  
    // Auto-set the result based on total percentage
    this.clickedData.result = this.clickedData.totalPercentage >= 60 ? 'Pass' : 'Fail';
  
    console.log("Auto-Evaluated Percentage:", this.clickedData.autoPercentage);
    console.log("Manually-Evaluated Percentage:", this.clickedData.manualPercentage);
    console.log("Total Percentage:", this.clickedData.totalPercentage);
  }
  
  
}


