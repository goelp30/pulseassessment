import { Component } from '@angular/core';
import { EvaluationService } from '../service/evaluation.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../common/button/button.component';
import { CommonModule } from '@angular/common';
import { map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-view-assessment',
  standalone: true,
  imports: [ButtonComponent,CommonModule],
  templateUrl: './view-assessment.component.html',
  styleUrl: './view-assessment.component.css'
})
export class ViewAssessmentComponent {
  clickedData:any;
  evaluationList: any[] = [];
  quizId: string = '';  // Initialize quizId as a string
  firebaseservice: any;
  constructor(private evaluationService: EvaluationService,private router:Router){}
  ngOnInit(): void {
     this.evaluationService.clickedData$.subscribe(data => {
       this.clickedData = data; // Store the clicked row data
       console.log('Clicked Data:', this.clickedData);
     })
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
    
   
     this.firebaseservice.getItemsByQuizId('EvaluationQuizAnswerData', quizId).pipe(
       mergeMap((evaluationData: any[]) => {
         // console.log('Firebase query response:', evaluationData);
   
         // Fetch the corresponding question data based on the questionId for each evaluation
         const questionIds = evaluationData.map(item => item.questionId);
         return this.firebaseservice.getQuestionsByIds(questionIds).pipe(
           mergeMap((questionData: any[]) => {
             // Fetch all options for the questions
             return this.firebaseservice.getAllOptions().pipe(
               map((optionData: any[]) => {
                 // Combine evaluation data with question and options details
                 const combinedData = evaluationData.map(item => {
                   const question = questionData.find(q => q.questionId === item.questionId);
                   const options = optionData.filter(opt => opt.questionId === item.questionId);
                   return {
                     ...item,
                     questionText: question?.questionText,
                     questionWeitage: question?.questionWeitage,
                     questionType: question?.questionType,
                     options: options,  // Add the options for each question
                   };
                 });
   
                 // Return the combined data
                 return combinedData;
               })
             );
           })
         );
       })
     ).subscribe(
       (combinedData: any[]) => {
         console.log('Combined evaluation list:', combinedData);
         // Store the combined data in the component
         this.evaluationList = combinedData;
   
         // Also set the clickedData to be used in the template
       
   
        //  // Automatically evaluate the objective questions (single_answer, multi_answer)
        //  this.evaluateAutoScoredQuestions();
       },
       (error: any) => {
         console.error('Error fetching combined data:', error);
       }
     );
   }
   
// Calculate the total max marks for all questions
getTotalMarks(): number {
  let totalMarks = 0;
  this.evaluationList.forEach((question: any) => {
    totalMarks += question.questionWeitage;
  });
  return totalMarks;
}

//Routing to the dashboard
onSubmit(){
this.router.navigate(['/evaluation']);
}}

