export interface Question {
    questionId: string;
    subjectId: string;
    questionText: string;
    questionType: string;
    questionLevel: string;
    questionWeightage: number;
    questionTime: number;
    createdOn: number;
    updatedOn: number;
    isQuesDisabled?: boolean;
  }
   
  export interface Option {
    optionId: string;
    questionId: string;
    subjectId: string;
    optionText: string;
    isCorrectOption: boolean;
    isOptionDisabled?:boolean
  }
  
   