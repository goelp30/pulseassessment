export interface Question {
  id: number;
  questionType: 'descriptive' | 'medium' | 'hard';
  text: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer?: number;
  descriptiveAnswer?: string;
  isMarkedForReview: boolean;
  isVisited: boolean;
}

