export type QuizAnswer = {
  userAnswer?: string[];
  answer?: string;
  isDescriptive: boolean;
  questionId: string;
  quizId: string;
  marks: string;
};

export type QuizAnswers = {
  [quizId: string]: {
    [questionId: string]: QuizAnswer;
  };
};
