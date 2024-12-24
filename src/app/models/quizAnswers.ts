export interface Answer {
  questionId: string;
  isDescriptive: boolean;
  marks: string;
  userAnswer: string[];
  answer: string;
  maxMarks?: string;
  questionType: string;
  isEvaluated: boolean;
  evaluatedAt: string;
  quizId?: string; // Optional for backward compatibility
}

export interface QuizAnswer {
  userId: string;
  assessmentId: string;
  answers: { [key: string]: Answer };
  totalMarks: number;
  submittedAt: string;
  isAutoEvaluated: boolean;
  isPassed: boolean;
  // Backward compatibility fields
  questionId?: string;
  quizId?: string;
  isDescriptive?: boolean;
  marks?: string;
  userAnswer?: string[];
  answer?: string;
  maxMarks?: string;
  questionType?: string;
  isEvaluated?: boolean;
  evaluatedAt?: string;
}

export interface QuizAnswers {
  [quizId: string]: {
    [questionId: string]: Answer;
  };
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

