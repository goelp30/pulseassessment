import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluationService } from '../service/evaluation.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { mergeMap, map } from 'rxjs/operators';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizAnswers } from '../../../models/quizAnswers';
@Component({
  selector: 'app-evaluate-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './evaluate-assessment.component.html',
  styleUrls: ['./evaluate-assessment.component.css'],
})
export class EvaluateAssessmentComponent implements OnInit {
  clickedData: any = {};
  successMessage: boolean = false;
  evaluationList: any[] = [];
  quizId: string = ''; // Initialize quizId as a string

  constructor(
    private evaluationService: EvaluationService,
    private router: Router,
    private firebaseservice: FireBaseService<QuizAnswers>
  ) {}

  ngOnInit(): void {
    // Listen for clicked data updates
    this.evaluationService.clickedData$.subscribe((data) => {
      this.clickedData = data; // Store the clicked row data
      console.log('Clicked Data:', this.clickedData);
    });

    // Listen for quizId updates and fetch evaluation data
    this.evaluationService.quizId$.subscribe((quizId) => {
      if (quizId) {
        this.quizId = quizId;
        console.log('Quiz ID received:', this.quizId);
        // Fetch evaluation data when quizId is available
        this.getEvaluationDataByQuizId(this.quizId);
      }
    });
  }

  getEvaluationDataByQuizId(quizId: string): void {
    // Fetch evaluation data from Firebase based on the quizId
    this.firebaseservice
      .getItemsByQuizId('QuizAnswer', quizId)
      .pipe(
        mergeMap((evaluationData: any[]) => {
          const questionIds = evaluationData.map((item) => item.questionId);
          return this.firebaseservice.getQuestionsFromIds('EvaluationQuestionData', questionIds).pipe(
            mergeMap((questionData: any[]) => {
              return this.firebaseservice.getAllOptions('EvaluationOptionData').pipe(
                map((optionData: any[]) => {
                  const optionsMap = optionData.reduce((acc, option) => {
                    if (!acc[option.questionId]) {
                      acc[option.questionId] = [];
                    }
                    acc[option.questionId].push(option);
                    return acc;
                  }, {} as { [key: string]: any[] });

                  const combinedData = evaluationData.map((item) => {
                    const question = questionData.find((q) => q.questionId === item.questionId);
                    const options = optionsMap[item.questionId] || [];
                    return {
                      ...item,
                      questionText: question?.questionText,
                      questionWeitage: question?.questionWeitage,
                      questionType: question?.questionType,
                      options: options,
                    };
                  });
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
          this.evaluationList = combinedData;
          this.evaluateAutoScoredQuestions();
        },
        (error: any) => {
          console.error('Error fetching combined data:', error);
        }
      );
  }

  onMarksChange(question: any): void {
    if (question.assigned_marks > question.questionWeitage) {
      question.assigned_marks = question.questionWeitage; // Reset to max allowed marks
    }

    if (question.questionType === 'Descriptive') {
      question.marks = question.assigned_marks; // Assign marks for descriptive questions
    }

    // Recalculate total marks after changes
    this.getUserTotalMarks();
  }

  evaluateAutoScoredQuestions(): void {
    this.evaluationList.forEach((question: any) => {
      if (question.questionType === 'Single') {
        const selectedOption = question.options.find((option: { optionId: any }) => option.optionId === question.userAnswer);
        question.marks = selectedOption?.isCorrectOption ? question.questionWeitage : 0;
      } else if (question.questionType === 'Multiple Choice') {
        const correctOptions = question.options
          .filter((option: { isCorrectOption: any }) => option.isCorrectOption)
          .map((option: { optionId: any }) => option.optionId);
        
        let selectedAnswers = question.userAnswer;
        if (typeof selectedAnswers === 'string') selectedAnswers = [selectedAnswers];
        
        let correctCount = 0;
        selectedAnswers.forEach((answer: any) => {
          if (correctOptions.includes(answer)) correctCount++;
        });

        const marksPerCorrectAnswer = question.questionWeitage / correctOptions.length;
        question.marks = correctCount * marksPerCorrectAnswer;

        // Apply penalty for extra answers
        const extraAnswersSelected = selectedAnswers.length - correctOptions.length;
        if (extraAnswersSelected > 0) {
          const penaltyPerExtraAnswer = question.questionWeitage / correctOptions.length;
          question.marks -= extraAnswersSelected * penaltyPerExtraAnswer;
          if (question.marks < 0) question.marks = 0;
        }
      }
    });
  }

  getUserTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.marks || 0);
    }, 0);
  }

  getTotalMarks(): number {
    return this.evaluationList.reduce((totalMarks, question) => {
      return totalMarks + (question.questionWeitage || 0);
    }, 0);
  }
// onSubmit(): void {
//     // Ensure evaluationList is not undefined and has data
//     if (!this.evaluationList || this.evaluationList.length === 0) {
//       console.error('No evaluation questions available');
//       return; // Prevent further execution if there are no questions
//     }
  
//     // If the assessment is already evaluated, navigate to the view page
//     if (this.clickedData?.isEvaluation) {
//       this.router.navigate(['/view']);
//       return;
//     }
  
//     // Manually assign marks for descriptive questions
//     this.evaluationList.forEach((question: any) => {
//       if (question.questionType === 'Descriptive') {
//         question.marks = question.assigned_marks; // Assign marks for descriptive questions
//       }
//     });
  
//     // Calculate the total marks
//     this.getUserTotalMarks();
//     this.successMessage = true;
  
//     const updates: { [path: string]: any } = {};
  
//     // Prepare the update path for AssessmentData
//     const assessmentPath = `AssessmentData/${this.quizId}`;
//     updates[assessmentPath] = {
//       isEvaluated: true,
//       result: this.clickedData.result,
//     };
  
//     // Loop through each question in the evaluation list and prepare the updates for QuizAnswer
//     this.evaluationList.forEach((question: any) => {
//       const quizAnswerPath = `QuizAnswer/${this.quizId}/${question.questionId}`;
  
//       // Ensure that the marks are set to a valid number, default to 0 if not present
//       const marksToUpdate = Number(question.marks) || 0;
  
//       // Log the update path and marks being sent to Firebase
//       console.log(`Updating path: ${quizAnswerPath} with marks: ${marksToUpdate}`);
  
//       // Prepare the update for each question's marks
//       updates[quizAnswerPath] = {
//         marks: marksToUpdate.toString(),  // Ensure marks are stored as strings
//         userAnswer: question.userAnswer || [], // Store user answers (if any)
//         isDescriptive: question.questionType === 'Descriptive', // Store if the question is descriptive
//       };
//     });
  
//     // Log the updates object for verification before proceeding
//     console.log('Updates object:', updates);
  
//     // Perform the batch update in Firebase
//     this.firebaseservice.batchUpdate(updates)
//       .then(() => {
//         console.log('Assessment and Quiz Answers updated successfully');
//         alert('Assessment evaluated and results saved successfully.');
//         this.router.navigate(['/view']);
//       })
//       .catch((error) => {
//         console.error('Error updating data in Firebase:', error);
//         alert('There was an error updating the assessment data. Please try again.');
//       });
//   }
onSubmit(): void {
  // Ensure evaluationList is not undefined and has data
  if (!this.evaluationList || this.evaluationList.length === 0) {
    console.error('No evaluation questions available');
    return; // Prevent further execution if there are no questions
  }

  // If the assessment is already evaluated, navigate to the view page
  if (this.clickedData?.isEvaluation) {
    this.router.navigate(['/view']);
    return;
  }

  // Manually assign marks for descriptive questions
  this.evaluationList.forEach((question: any) => {
    if (question.questionType === 'Descriptive') {
      question.marks = question.assigned_marks; // Assign marks for descriptive questions
    }
  });

  // Calculate the total marks
  this.getUserTotalMarks();
  this.successMessage = true;

  const updates: { [path: string]: any } = {};

  // Prepare the update path for AssessmentData
  const assessmentPath = `AssessmentData/${this.quizId}`;
  updates[assessmentPath] = {
    isEvaluated: true,
    result: this.clickedData.result,
  };

  // Loop through each question in the evaluation list and prepare the updates for QuizAnswer
  this.evaluationList.forEach((question: any) => {
    const quizAnswerPath = `QuizAnswer/${this.quizId}/${question.questionId}`;

    // Ensure that the marks are set to a valid number, default to 0 if not present
    const marksToUpdate = Number(question.marks) || 0;

    // Log the update path and marks being sent to Firebase
    console.log(`Updating path: ${quizAnswerPath} with marks: ${marksToUpdate}`);

    // Prepare the update for each question's marks
    updates[quizAnswerPath] = {
      marks: marksToUpdate.toString(),  // Ensure marks are stored as strings
      userAnswer: question.userAnswer || [], // Store user answers (if any)
      isDescriptive: question.questionType === 'Descriptive', // Store if the question is descriptive
    };
  });

  // Log the updates object for verification before proceeding
  console.log('Updates object:', updates);

  // Perform the batch update in Firebase
  this.firebaseservice.batchUpdate(updates)
    .then(() => {
      console.log('Assessment and Quiz Answers updated successfully');
      alert('Assessment evaluated and results saved successfully.');

      // Navigate to the view page after successful update
      this.router.navigate(['/view']);
    })
    .catch((error) => {
      console.error('Error updating data in Firebase:', error);
      alert('There was an error updating the assessment data. Please try again.');
    });
}

}
