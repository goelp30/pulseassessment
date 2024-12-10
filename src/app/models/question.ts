export type Question={
    subjectId:string,
    questionId : any,
    questionText:any,
    questionType:string,
    questionLevel:string,
    questionWeightage:number,
    questionTime:number,
    createdOn:number,
    updatedOn:number,
    isQuesDisabled?: boolean;
}
 
export type Option={
    subjectid:string,
    questionId: string,
    optionId : string,
    optionText:any,
    isCorrectOption:boolean
}
 

// export type Question = {
//     correct: string[]; // Array of correct answers
//     createdOn: string; // ISO Date string
//     isDisabled: boolean; // Whether the question is disabled
//     max_marks: number; // Maximum marks for the question
//     options: string[]; // Array of options
//     questionLevel: string; // Difficulty level
//     questionType: string; // Type of question (e.g., single, multiple)
//     text: string; // Question text
//     timer: number; // Time for the question in seconds
//     updatedOn: string; // ISO Date string
// };
