import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluation-header',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './evaluation-header.component.html',
  styleUrl: './evaluation-header.component.css',
})
export class EvaluationHeaderComponent {
  @Input() assessmentName: string = '';
  @Input() userMarks: number = 0;
  @Input() totalMarks: number = 0;
  @Input() result?: string;

  calculateResult(): string {
    if (this.totalMarks === 0) {
       return 'Fail'; // Or handle it differently if no total marks
    }
    const passPercentage = 0.7; // 70%
    return this.userMarks / this.totalMarks >= passPercentage ? 'Pass' : 'Fail';
}
}
