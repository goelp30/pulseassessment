import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluationService } from '../service/evaluation.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { EvaluationQuizAnswerData } from '../../../models/EvaluationQuizAnswerData';
import { mergeMap, map } from 'rxjs/operators';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationAssessmentData } from '../../../models/EvaluationAssessmentData';
import { QuizAnswer, QuizAnswers } from '../../../models/quizAnswers';

@Component({
  selector: 'app-evaluate-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css'],
})
export class EvaluateAssessmentComponent implements OnInit {
  clickedData: any;
  successMessage: boolean = false;
  evaluationList: any[] = [];
  quizId: string = ''; // Initialize quizId as a string

  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>
  ) {}

  ngOnInit(): void {
    this.evaluationService.clickedData$.subscribe((data) => {
      this.clickedData = data; // Store the clicked row data
      console.log('Clicked Data:', this.clickedData);
    });
    this.evaluationService.quizId$.subscribe((quizId) => {
      if (quizId) {
        this.quizId = quizId;
        // Fetch the evaluation data when quizId is available
        this.getEvaluationDataByQuizId(this.quizId);
        console.log(this.quizId);
      }
    });
  }

  // Function to get evaluation data by quizId
  getEvaluationDataByQuizId(quizId: string): void {
    this.firebaseservice
      .getItemsByQuizId('QuizAnswer', quizId)
      .pipe(
        mergeMap((evaluationData: any[]) => {
          // console.log('Firebase query response:', evaluationData);

          // Fetch the corresponding question data based on the questionId for each evaluation
          const questionIds = evaluationData.map((item) => item.questionId);
          return this.firebaseservice.getQuestionsByIds(questionIds).pipe(
            mergeMap((questionData: any[]) => {
              // Fetch all options for the questions
              return this.firebaseservice.getAllOptions().pipe(
                map((optionData: any[]) => {
                  // Combine evaluation data with question and options details
                  const combinedData = evaluationData.map((item) => {
                    const question = questionData.find(
                      (q) => q.questionId === item.questionId
                    );
                    const options = optionData.filter(
                      (opt) => opt.questionId === item.questionId
                    );
                    return {
                      ...item,
                      questionText: question?.questionText,
                      questionWeitage: question?.questionWeitage,
                      questionType: question?.questionType,
                      options: options, // Add the options for each question
                    };
                  });
                  // Return the combined data
                  return combinedData;
                })
              );
            })
          );
        })
      )
      .subscribe(
        (combinedData: any[]) => {
          console.log('Combined evaluation list:', combinedData);
          // Store the combined data in the component
          this.evaluationList = combinedData;

          // Also set the clickedData to be used in the template

          // Automatically evaluate the objective questions (single_answer, multi_answer)
          this.evaluateAutoScoredQuestions();
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
        }
      );
  }
  onMarksChange(question: any) {
    if (question.assigned_marks > question.questionWeitage) {
      // Ensure the marks do not exceed the maximum allowed for the question
      question.assigned_marks = question.questionWeitage; // Reset to max allowed marks
    }

    // For descriptive questions, we update the marksScored with the assigned_marks
    if (question.questionType === 'Descriptive') {
      question.marks = question.assigned_marks;
    }
    // Recalculate total marks
    this.getUserTotalMarks();
  }

  evaluateAutoScoredQuestions(): void {
    this.evaluationList.forEach((question: any) => {
      if (question.questionType === 'Single') {
        // Automatically calculate marks for single-answer questions
        const selectedOption = question.options.find(
          (option: { optionId: any }) => option.optionId === question.userAnswer
        );

        if (selectedOption?.isCorrectOption) {
          question.marks = question.questionWeitage;
        } else {
          question.marks = 0;
        }
      } else if (question.questionType === 'Multiple Choice') {
        // Get the correct answers (array of correct option IDs)
        const correctOptions = question.options
          .filter((option: { isCorrectOption: any }) => option.isCorrectOption)
          .map((option: { optionId: any }) => option.optionId); // Collect the IDs of correct options

        let selectedAnswers = question.userAnswer; // The user's selected answers

        // If selectedAnswers is a string (can happen in some cases), convert it into an array
        if (typeof selectedAnswers === 'string') {
          selectedAnswers = [selectedAnswers];
        }

        let correctCount = 0;

        // Count how many selected answers are correct
        selectedAnswers?.forEach((answer: any) => {
          if (correctOptions.includes(answer)) {
            correctCount++;
          }
        });

        // Calculate marks based on the correct answers
        if (correctCount > 0) {
          const marksPerCorrectAnswer =
            question.questionWeitage / correctOptions.length;
          question.marks = correctCount * marksPerCorrectAnswer;
        } else {
          question.marks = 0;
        }

        // Apply penalties for extra answers selected
        const extraAnswersSelected =
          selectedAnswers.length - correctOptions.length;
        if (extraAnswersSelected > 0) {
          const penaltyPerExtraAnswer =
            question.questionWeitage / correctOptions.length;
          question.marks -= extraAnswersSelected * penaltyPerExtraAnswer;

          // Ensure marks don't go negative
          if (question.marks < 0) {
            question.marks = 0;
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
    this.evaluationList.forEach((question: any) => {
      if (question.question_type === 'Descriptive') {
        // Manually assign the marks for descriptive questions
        question.marks = question.assigned_marks;
      }
    });

    // After assigning marks for descriptive questions, recalculate total marks
    this.getUserTotalMarks();

    // Set the isEvaluation flag to true to indicate that the evaluation is complete
    this.clickedData.isEvaluation = true;

    // Show success message after the evaluation is complete
    this.successMessage = true;
    

    // const updateData: Partial<EvaluationAssessmentData> = {
    //   result: this.clickedData.result,            // Assuming `this.clickedData.result` has the updated value
    //   status: 'Completed',
    //   isEvaluation:true
    // };

    // Update the data in Firebase
    // this.firebaseservice.update(`EvaluationAssessmentData/${this.quizId}`, updateData)
    //   .then(() => {
    //     console.log('Evaluation results updated successfully!');
    //     // Navigate to the 'view' page after saving
    //     this.router.navigate(['/view']);
    //   })
    //   .catch((error) => {
    //     console.error('Error saving evaluation data to Firebase:', error);
    //   });

    // Navigate to the 'view' page after the evaluation is done
  }
  getUserTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.marks || 0); // Sum the marksScored for each question
    }, 0);
  }

  // Assuming you want to calculate the total possible marks (if it exists in your data)
  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeitage || 0); // Add up the weitage (or total marks) per question
    }, 0);
  }
}
