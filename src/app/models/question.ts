export type Question={
    Subjectid:string,
    questionId : any,
    questionText:any,
    questionType:string,
    questionLevel:string,
    questionWeitage:string,
    answer:string[],
    option:string[],
    questionTime:string,
    createdOn:number,
    updatedOn:number,
    isquesDisabled?: boolean;
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
