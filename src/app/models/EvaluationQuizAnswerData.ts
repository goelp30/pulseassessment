export type EvaluationQuizAnswerData = {
  quizId: string;
  questionId: string;
  answer: string;
  correctOptionId: string[];
  isDescriptive: boolean;
  marksScored: string;
};
export type QuizAnswers = {
  [quizId: string]: { [questionId: string]: EvaluationQuizAnswerData };
};
