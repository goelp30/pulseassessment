import { Injectable } from '@angular/core';
import { Question } from '../../../models/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseQuestions: Question[] = [
    {
      id: 1,
      questionType: 'medium',
      text: 'What is the main building block of Angular applications?',
      options: ['Components', 'Modules', 'Services', 'Templates'],
      correctAnswer: 0, // Single choice correct answer
      isMarkedForReview: false,
      isVisited: false,
    },
    {
      id: 2,
      questionType: 'descriptive',
      text: 'Explain the concept of dependency injection in Angular and its benefits.',
      options: [],
      correctAnswer: -1, // No correct answer for descriptive questions
      isMarkedForReview: false,
      isVisited: false,
    },
    {
      id: 3,
      questionType: 'hard',
      text: 'What is Change Detection in Angular and how does it work?',
      options: ['Manual checking of values', 'Zone.js tracking changes', 'Regular DOM updates', 'Continuous polling'],
      correctAnswer: 1, // Single choice correct answer
      isMarkedForReview: false,
      isVisited: false,
    },
  ];

  // Generate questions with dynamic descriptive and multi-check questions
  generateQuestions(): Question[] {
    const questions = [...this.baseQuestions];
    const topics = ['Services', 'Routing', 'Forms', 'HTTP', 'Directives', 'Pipes', 'CLI'];
    const actions = ['implement', 'configure', 'use', 'define', 'create'];

    // Add more descriptive questions
    questions.push({
      id: 4,
      questionType: 'descriptive',
      text: 'Compare and contrast Angular Services and Components. When would you use each?',
      options: [],
      correctAnswer: -1, // No correct answer for descriptive questions
      isMarkedForReview: false,
      isVisited: false,
    });

    // Add a multi-check question
    questions.push({
      id: 5,
      questionType: 'multi-check', // Multi-check question type
      text: 'Which of the following are core Angular concepts?',
      options: ['Components', 'Templates', 'Directives', 'Style Binding'],
      correctAnswer: [0, 1, 2], // Multiple correct answers
      isMarkedForReview: false,
      isVisited: false,
    });

    // Generate remaining questions dynamically
    for (let i = questions.length; i < 20; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const type = Math.random() > 0.8 ? 'descriptive' : Math.random() > 0.5 ? 'medium' : 'hard';

      if (type === 'descriptive') {
        questions.push({
          id: i + 1,
          questionType: type,
          text: `Explain how to ${action} Angular ${topic} and discuss its importance in application development.`,
          options: [],
          correctAnswer: -1, // No correct answer for descriptive questions
          isMarkedForReview: false,
          isVisited: false,
        });
      } else {
        questions.push({
          id: i + 1,
          questionType: type,
          text: `How do you ${action} Angular ${topic}?`,
          options: [
            `Using the ${topic} module`,
            `Through ${topic} configuration`,
            `With ${topic} implementation`,
            `Via ${topic} service`,
          ],
          correctAnswer: Math.floor(Math.random() * 4), // Randomly selecting a correct option
          isMarkedForReview: false,
          isVisited: false,
        });
      }
    }

    return questions;
  }

  // Calculate time based on question type
  calculateQuestionTime(questionType?: string): number {
    switch (questionType?.toLowerCase()) {
      case 'medium':
      case 'hard':
        return 1; // 1 minute for medium and hard questions
      case 'descriptive':
        return 3; // 3 minutes for descriptive questions
      case 'multi-check':
        return 2; // 2 minutes for multi-check questions
      default:
        return 2; // Default time for other types
    }
  }
}
