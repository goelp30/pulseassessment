export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function calculateQuestionTime(questionType?: string): number {
  switch (questionType?.toLowerCase()) {
    case 'medium': return 8;
    case 'hard': return 12;
    case 'descriptive': return 60;
    default: return 8;
  }
}