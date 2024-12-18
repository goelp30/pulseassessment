
export type QuizAnswer = {
  userAnswer?: string[];        // Array of user answers (if applicable)
  answer?: string;              // Descriptive answer (if applicable)
  isDescriptive: boolean;       // Indicates if the question is descriptive
  questionId: string;           // Unique ID for the question
  quizId: string;               // Unique ID for the quiz
  marks: string;                // Marks or score for the answer (initially can be empty)
}


export type QuizAnswers = {
  [quizId: string]: {        
    [questionId: string]: QuizAnswer;  
  };
}
