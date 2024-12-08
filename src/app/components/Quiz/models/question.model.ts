export interface Question {
  id: number;
  questionType: 'medium' | 'hard' | 'descriptive' | 'multi-check'; // Added multi-check type
  text: string;
  options: string[];
  correctAnswer: number | number[]; // Allow both single choice (number) and multi-check (number[])
  isMarkedForReview: boolean;
  isVisited: boolean;
  descriptiveAnswer?: string; // Optional for descriptive questions
  selectedAnswer?: number | number[]; // To handle selected answers for single or multiple choices
}
