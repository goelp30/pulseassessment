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
}
