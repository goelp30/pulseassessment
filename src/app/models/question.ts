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
  isMarkedForReview?: boolean;
  isVisited?: boolean;
  selectedAnswer?: any;
  descriptiveAnswer?: string;
  options?: Option[];
  marks: number;
}

export interface Option {
  optionId: string;
  questionId: string;
  subjectId: string;
  optionText: string;
  isCorrectOption: boolean;
  isOptionDisabled?: boolean;
  createdOn: number;
  updatedOn: number;
}
