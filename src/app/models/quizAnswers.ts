export interface QuizAnswer {
  questionId: string;
  quizId: string;
  isDescriptive: boolean;
  marks: string;
  userAnswer: string[];
  answer: string;
  maxMarks?: string;
  questionType: string;
  isEvaluated: boolean;
  evaluatedAt: string;
}

export interface AssessmentData {
  assessmentID: string;
  quizId: string;
  isEvaluated: boolean;
  userId: string;
  result: string;
  submittedAt: string;
  totalMarks: string;
  maxMarks: string;
  percentage: string;
}

export interface QuizAnswers {
  [quizId: string]: {
    [questionId: string]: QuizAnswer;
  };
}