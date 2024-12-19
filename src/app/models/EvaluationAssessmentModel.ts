export type EvaluationAssessmentModel = {
  assessmentID: string;
  quizId: string;
  status: string;
  isEvaluation: boolean;
  isAutoEvaluated: boolean;
  userId: string;
  marksScored: number;
  result: string;
};
