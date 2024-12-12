export interface Question {
  questionId: number;
  questionType: string;
  questionText: string;
  isQuesDisabled: string;
  questionLevel: string;
  questionWeightage: number;
  subjectId: string;
  updatedOn: number;
  createdOn: number;
  questionTime: number;
  isMarkedForReview?: boolean;
  isVisited?: boolean;
  selectedAnswer?: number | number[];
  descriptiveAnswer?: string;
}
 
export interface Options {
  subjectid:string,
  questionId: string,
  optionId : string,
  optionText:any,
  isCorrectOption:boolean;
}